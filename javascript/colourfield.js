(function($){

	function applyColourPickerTo(jQel) {
		function updateField(hsb, hex, rgb) {
				var mid = (rgb.r + rgb.g + rgb.b) / 3;
				var col = mid > 127 ? '#000000' : '#ffffff';
				jQel.val(hex).css({color:col, backgroundColor:'#' + hex});
		}
		return jQel.ColourPicker({
			onSubmit: updateField,
			onChange: updateField,
			onBeforeShow: function () {
				$(this).ColourPickerSetColour(this.value);
			}
		})
	}
	
	$(function() { //document.ready
		if($.entwine) {
			$.entwine('cpf', function($){
				$('.ColourPickerInput').entwine({
					"onmatch": function(e) {
						applyColourPickerTo($(this))
					},
					"onkeyup": function(e) {
						this.ColourPickerSetColour(this.val())
					}
				})
			})
		}
		else {
			applyColourPickerTo($('.ColourPickerInput')).keyup(function(){
				$(this).ColourPickerSetColour(this.value)
			})
		}
	})
}(jQuery))