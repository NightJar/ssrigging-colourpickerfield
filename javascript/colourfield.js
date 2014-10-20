var ColourFieldHandler = function(){
	var $ = jQuery;
	
	this.initAll = function(){
		var fnc = this.initById;
		$('.ColourPickerInput').each(function(){
			fnc('#' + $(this).attr('id'));
		});
	}
	
	this.initById = function(id){
		$(id).ColourPicker({
			onSubmit: function(hsb, hex, rgb) {
				var mid = (rgb.r + rgb.g + rgb.b) / 3;
				var col = mid > 127 ? '#000000' : '#ffffff';
				$(id).val(hex).css({color:col, backgroundColor:'#' + hex});
			},
			onBeforeShow: function () {
				$(this).ColourPickerSetColour(this.value);
			}
		}).bind('keyup', function(){
			$(this).ColourPickerSetColour(this.value);
		});
	}
}

CFHandler = new ColourFieldHandler();

//check if prototype wrapper is required.
if(typeof Behaviour == 'object'){
	Behaviour.register({
		'.ColourPickerInput' : {
			initialise : function(){
				CFHandler.initById('#' + this.id);
			}
		}	
	});
}

jQuery(document).ready(function(){
	CFHandler.initAll();
});