-- Add slots field to Dryn's equipment items per the Shadowdark rules.
-- Worn items (cloak, ring, pendant) get slots: 0.
-- Longbow gets slots: 2 (heavy weapon).
-- All others default to 1 slot (field omitted per schema convention, but
-- set explicitly here so the data is unambiguous).

UPDATE characters
SET equipment = '[
  {"name":"Leather armor","type":"armor","slots":1,"properties":["AC 11 + DEX mod"],"equipped":true},
  {"name":"Dagger","type":"weapon","slots":1,"damage":"1d4","properties":["Finesse","Thrown","Close","Near"],"equipped":true},
  {"name":"Shortsword","type":"weapon","slots":1,"damage":"1d6","properties":["Finesse","Close"],"equipped":true},
  {"name":"Thieves'' tools","type":"gear","slots":1,"description":"Picks, tension wrenches, mirror wire, and chalk for bypassing locks and traps."},
  {"name":"Torch (extinguished)","type":"gear","slots":1,"description":"Burns for 1 hour, illuminates near range.","quantity":1},
  {"name":"Rations","type":"gear","slots":1,"description":"1 day''s rations.","quantity":1},
  {"name":"Elven longbow","type":"weapon","slots":2,"damage":"1d8","properties":["Two-handed","Far"],"equipped":false},
  {"name":"Arrows","type":"ammunition","slots":1,"quantity":17},
  {"name":"Cloak of Elvenkind","type":"gear","slots":0,"description":"Grants advantage on DEX (stealth) checks. To most mortals it appears as a well-made traveling cloak of muted gray-green, but to those with the Sight it marks the wearer clearly."},
  {"name":"Mysterious silver ring","type":"gear","slots":0,"description":"Band etched with tiny runes spiraling its circumference. The pale blue-white stone pulses with its own gentle radiance. Purpose not yet revealed."},
  {"name":"Crimson potion","type":"gear","slots":1,"description":"A vial of swirling crimson liquid found in a sealed chest. Effects unknown."},
  {"name":"Threshold Pendant","type":"gear","slots":0,"description":"Received from Aelindra. Bears the Threshold Mark — grants the ability to step between spaces, but only to places of significance."}
]'
WHERE id = 'D7V6qg4W01l9DEwtUEGPR';