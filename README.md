SilverStripe Colour Picker Field
================================

Requirements
------------
- SilverStripe 3.0

Installation
------------
- Simply drop into silverstripe root (using whatever method)
- Ensure the folder is named 'colourpickerfield'
- dev/build
- admin?flush=all

Usage
-----
`ColourField::create()`


About
-----
The site requires an admin to be able to specify a selection of colours for something (eg. a product)?
This field will render a text field that will accept a hexidecimal RGB definition. It supplies a (jQuery powered) popup to facilitate this for those who do not know nor care what a hexidecimal RGB colour definition is. It even changes the background colour of the field to provide a live preview.
Intended for use with the CMS, but should also work on the front end.

Notes
-----
- This is a port & polish of the well old original colorpickerfield that was available for SS v2.4 (by Roman Schmid aka Banal); only with all the spelling mistakes corrected.