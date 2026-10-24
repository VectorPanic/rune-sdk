# Tile definitions

The `tiles` field describes properties by tile value, not by a cell's linear
index. A definition can select one value or share properties across several:

```json
"tiles": [
  {
    "values": [1, 2, 5],
    "collision": "0x1111",
    "material": {
      "name": "stone"
    }
  },
  {
    "value": 3,
    "collision": "0x0100"
  }
]
```

Use either `value` or `values` in each definition. A `values` array must contain
at least one non-negative safe integer. Duplicate values are rejected, including
duplicates within a group or between single-value and grouped definitions.
Existing single-value definitions and omitted `tiles` remain supported.
Legacy single-value definitions also accept numeric strings, such as `"value": "3"`.

Definitions apply to both layers. Lookup uses the value stored in a cell:

```js
var value = map.back.getTileValueAt(index);
var properties = map.getTilePropertiesOf(value);
```

`getTilePropertiesOf()` returns `null` when no definition exists. Values in a
group return the same map-owned object. Changing a property therefore affects
every value in that group, on both layers. Changing `value` or `values` on the
returned object does not remap the lookup; those selectors are read at load time.

Each loaded `Tilemap` or `TileGraphic` owns a deep copy of its definitions,
including nested custom properties. Changes do not modify the source resource
or another map instance. Reloading restores the source definitions.

Invalid definitions are rejected before replacing the current map's data.
Layer values and texture frame selection are unchanged: grouping metadata does
not merge tile values or change their appearance. Raycast uses the same tile
property lookup without requiring a separate format.
