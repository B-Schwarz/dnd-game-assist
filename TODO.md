# Design of Character Sheet:

## Page 1
1. [x] Frame around armor class field
2. [x] Level and XP, oval should be the height of the box
3. [x] class features box should be 50% larger
4. [x] species traits and feats box should extend to the bottom
5. [x] Hit points, hit dice and death saves should be one box with the captions at the top
6. [x] Class features should be two text boxes next to each other to have two columns to write
7. [x] Move the player name input to the top left and outside the character sheet
8. [x] Remove the xp input field, as we do not use it in our games
9. [x] Round the corners of the shield (armor class)
10. [x] Add an HP bar to the bottom of the dnd-vitals card. It should be filled according to the current hit points
11. [x] Border of the AC card is not really visible
12. [x] Move the re-calculate button below heroic inspiration and into its column and incease the height of the equipment training and proficiencies card
13. [x] Change the colour of the colour picker to the chosen colour
14. [x] The expert pip should be green
15. [x] The weapons table should have vertical lines separating the columns
16. [x] The dnd-vitals should fill the whole card
17. [x] Modify the visual of the level input to match the pdf
18. [x] Examine the autosave feature. Decouple the current hit points from the remainder. This is needed for a future feature.

## Page 2
1. [x] The spell slots part should be like the PDF, i.e. a table with 3 columns, each having 3 spell levels, an input field for the amount of available slots and according to the number an amount of star shaped check boxes to check expended slots
2. [x] The Cantrips and prepared spells should be a separate card and expand to the bottom
3. [x] The magic item attunement should have a checkbox for each item
4. [x] The left side should be 2/3 of the page
5. [x] The coin names should be above the input field
6. [x] The prepared spells table should have vertical lines separating the columns
7. [x] Change the color of the checkboxes for the spell attributes. Concentraion should be yellow/gold, ritual should be purple and material blue
8. [x] Add a tooltip to the C/R/M that explains what it stands for
9. [x] Remove the tick from the C/R/M checkboxes
10. [x] Increase the page height to match the first page
11. [x] All checkboxes should be the same shape
12. [x] Extend the equipment box, so that the column reaches the end of the page
13. [x] Restore the old height of the Spell entries and make up the remaining space with new lines

# Character List

1. [x] Add Players name
2. [x] Move Player name to the end of the line

# Initiative

1. [x] Add a button to save the current health of the players to their character sheet. The current health should update for the character sheet automatically by polling for a change every 10 seconds
2. [x] Redesign the buttons to match the vibe of the character sheet (modern, sleek)
3. [x] Change the vorheriger/nächster buttons to arrows
4. [x] Change the chromatic of the leben speicher to green and put it left of board löschen
5. [x] Modernize the additional info of selected entities
6. [x] Add hotkeys, so that by pressing J the previous character is selected and with k the next one
7. [x] The conditions Rage and Konzentraion should be on their own line at the bottom, as they are the most common
8. [x] When the additional infos of one character is open, it should close when the turn is changed and the characters wohs turn it is should have its additional info opened
9. [x] Put the NPC Tag at the beginning of the line
10. [x] ~~A player should be able to click on their own character and toggle shield (with an input field to set a number) and~~ add the number behind the AC in paranthesis in this style: AC: 14 (+2). ~~Also they should be able to toggle concentraion and rage.~~ A DM should also be able to set the shield
    - Implemented variation: the **DM** sets the shield (toggle + value), concentration and rage from the entry's detail panel. The shield bonus is shown behind the AC everywhere as `AC: 14 (+2)` (visible to players too). Player self-service editing of their own character (clicking their own row to toggle shield/concentration/rage) was **deferred** — it needs a new ownership-checked self endpoint, since the initiative board is currently master-write only.
11. [x] The additional info should also be able to modify the initiative value
12. [x] in the additional info the dm should be able to share the HP of an npc with the players (default is hidden)
13. [x] a dead monster should be greyed out and at the bottom of the initiative and its turn should be skipped automatically. a dead player character should stay at the position and the background should be red. a dead npc should also be greyed out, but stay at its current position in the order.
14. [x] a hidden npcs background should be the same colour as the button
15. [x] swap out the arrows that change the order to an area that can be dragged to change the area that way.
16. [x] the color of the character should be the first item in the row.
17. [x] the tooltips for the conditions should contain a brief description to what the effect is

# Admin

1. [x] Add capability to set a users password (as admin)
2. [x] Add a new menu called characters

## Characters

1. [x] Button to export all characters
2. [x] Import characters
3. [x] Reassign character sheets
4. [x] NPC should not be reassignable
5. [x] Export singular characters

## Books

1. [x] Add/remove books

# Generic

1. [ ] Unit tests
2. [ ] Acceptance tests
3. [ ] Update dependencies
4. [ ] Update displayed version
