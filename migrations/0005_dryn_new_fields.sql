-- Populate new fields for Dryn.
-- Ancestry: Elf → languages: Common, Elvish, Sylvan
-- Class: Thief → no deity
-- Title is derived (Chaotic Thief L1 = "Cutpurse"), not stored
-- Silver/copper default to 0; gold already tracked separately

UPDATE characters
SET
  deity    = '',
  languages = '["Common","Elvish","Sylvan"]',
  silver   = 0,
  copper   = 0
WHERE id = 'D7V6qg4W01l9DEwtUEGPR';