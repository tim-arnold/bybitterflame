-- Migrate Dryn's equipment from plain strings to structured EquipmentItem objects.
-- Weapon stats from the Shadowdark equipment table.
-- Magical item descriptions sourced from the campaign narrative.

UPDATE characters
SET equipment = '[
  {"name":"Leather armor","type":"armor","properties":["AC 11 + DEX mod"],"equipped":true},
  {"name":"Dagger","type":"weapon","damage":"1d4","properties":["Finesse","Thrown","Close","Near"],"equipped":true},
  {"name":"Shortsword","type":"weapon","damage":"1d6","properties":["Finesse","Close"],"equipped":true},
  {"name":"Thieves'' tools","type":"gear","description":"Picks, tension wrenches, mirror wire, and chalk for bypassing locks and traps."},
  {"name":"Torch (extinguished)","type":"gear","description":"Burns for 1 hour, illuminates near range.","quantity":1},
  {"name":"Rations","type":"gear","description":"1 day''s rations.","quantity":1},
  {"name":"Elven longbow","type":"weapon","damage":"1d8","properties":["Two-handed","Far"],"equipped":false},
  {"name":"Arrows","type":"ammunition","quantity":17},
  {"name":"Cloak of Elvenkind","type":"gear","description":"Grants advantage on DEX (stealth) checks. To most mortals it appears as a well-made traveling cloak of muted gray-green, but to those with the Sight it marks the wearer clearly."},
  {"name":"Mysterious silver ring","type":"gear","description":"Band etched with tiny runes spiraling its circumference. The pale blue-white stone pulses with its own gentle radiance. Purpose not yet revealed."},
  {"name":"Crimson potion","type":"gear","description":"A vial of swirling crimson liquid found in a sealed chest. Effects unknown."},
  {"name":"Threshold Pendant","type":"gear","description":"Received from Aelindra. Bears the Threshold Mark — grants the ability to step between spaces, but only to places of significance."}
]'
WHERE id = 'D7V6qg4W01l9DEwtUEGPR';