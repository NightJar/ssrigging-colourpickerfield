<?php
/**
 * Colour field
 */
class ColourField extends TextField {
	
	public function __construct($name, $title = null, $value = '', $form = null){
		parent::__construct($name, $title, $value, 6, $form);
	}
	
	function Field($properties = array()) {
		Requirements::javascript(SAPPHIRE_DIR . "/thirdparty/jquery/jquery.js");
		Requirements::javascript("colourpickerfield/javascript/colourpicker.js");
		Requirements::javascript("colourpickerfield/javascript/colourfield.js");
		Requirements::css("colourpickerfield/css/colourpicker.css");
		$this->addExtraClass('ColourPickerInput');
		$style = 'background-color:' . ($this->value ? '#' . $this->value : '#ffffff'). 
				 '; color: ' . ($this->getTextColour()) . ';';
		$attributes = array(
			'type' => 'text',
			'class' => 'text' . ($this->extraClass() ? $this->extraClass() : ''),
			'id' => $this->id(),
			'name' => $this->getName(),
			'value' => $this->Value(),
//			'tabindex' => $this->getTabIndex(),
			'maxlength' => ($this->maxLength) ? $this->maxLength : null,
			'size' => ($this->maxLength) ? min( $this->maxLength, 30 ) : null,
			'style' => $style
		);
		
		if($this->disabled) $attributes['disabled'] = 'disabled';
		return $this->createTag('input', $attributes);
	}
	
	function validate($validator)
	{
		if(!empty ($this->value) && !preg_match('/^[A-f0-9]{6}$/', $this->value))
		{
			$validator->validationError(
				$this->name, 
				_t('ColourField.VALIDCOLOURFORMAT', 'Please enter a valid colour in hexadecimal format.'), 
				'validation', 
				false
			);
			return false;
		}
		return true;
	}
	
	protected function getTextColour()
	{
		if($this->value) {
			$c = intval($this->value, 16);
			$r = $c >> 16;
			$g = ($c >> 8) & 0xff;
			$b = $c & 0xff;
			$mid = ($r + $g + $b) / 3;
			return ($mid > 127) ? '#000000' : '#ffffff';
		} else {
			return '#000000';
		}
	}
}

/**
 * Disabled version of {@link ColourField}.
 */
class ColourField_Disabled extends ColourField {
	
	protected $disabled = true;
	
	function Field($properties = array()) {
		if($this->value) {
			$val = '#' . $this->value;
		} else {
			$val = '#ffffff';
		}
		
		$col = $this->getTextColour();
		
		return "<span class=\"readonly\" id=\"" . $this->id() . "\" style=\"color:$col; background:$val;\">$val</span>
				<input type=\"hidden\" value=\"{$this->value}\" name=\"$this->name\" />";
	}
	
	function Type() { 
		return "date_disabled readonly";
	}
	
	function jsValidation() {
		return null;
	}

	function php() {
		return true;
	}
	
	function validate($validator) {
		return true;	
	}
}
