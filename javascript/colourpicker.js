/**
 *
 * Colour picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 */
(function ($) {
	var ColourPicker = function () {
		var
			ids = {},
			inAction,
			charMin = 65,
			visible,
			tpl = '<div class="colourpicker"><div class="colourpicker_colour"><div><div></div></div></div><div class="colourpicker_hue"><div></div></div><div class="colourpicker_new_colour"></div><div class="colourpicker_current_colour"></div><div class="colourpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colourpicker_rgb_r colourpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colourpicker_rgb_g colourpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colourpicker_rgb_b colourpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colourpicker_hsb_h colourpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colourpicker_hsb_s colourpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colourpicker_hsb_b colourpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colourpicker_submit"></div></div>',
			defaults = {
				eventName: 'click',
				onShow: function () {},
				onBeforeShow: function(){},
				onHide: function () {},
				onChange: function () {},
				onSubmit: function () {},
				colour: 'ff0000',
				livePreview: true,
				flat: false
			},
			fillRGBFields = function  (hsb, cal) {
				var rgb = HSBToRGB(hsb);
				$(cal).data('colourpicker').fields
					.eq(1).val(rgb.r).end()
					.eq(2).val(rgb.g).end()
					.eq(3).val(rgb.b).end();
			},
			fillHSBFields = function  (hsb, cal) {
				$(cal).data('colourpicker').fields
					.eq(4).val(hsb.h).end()
					.eq(5).val(hsb.s).end()
					.eq(6).val(hsb.b).end();
			},
			fillHexFields = function (hsb, cal) {
				$(cal).data('colourpicker').fields
					.eq(0).val(HSBToHex(hsb)).end();
			},
			setSelector = function (hsb, cal) {
				$(cal).data('colourpicker').selector.css('backgroundColor', '#' + HSBToHex({h: hsb.h, s: 100, b: 100}));
				$(cal).data('colourpicker').selectorIndic.css({
					left: parseInt(150 * hsb.s/100, 10),
					top: parseInt(150 * (100-hsb.b)/100, 10)
				});
			},
			setHue = function (hsb, cal) {
				$(cal).data('colourpicker').hue.css('top', parseInt(150 - 150 * hsb.h/360, 10));
			},
			setCurrentColour = function (hsb, cal) {
				$(cal).data('colourpicker').currentColour.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			setNewColour = function (hsb, cal) {
				$(cal).data('colourpicker').newColour.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			keyDown = function (ev) {
				var pressedKey = ev.charCode || ev.keyCode || -1;
				if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
					return false;
				}
				var cal = $(this).parent().parent();
				if (cal.data('colourpicker').livePreview === true) {
					change.apply(this);
				}
			},
			change = function (ev) {
				var cal = $(this).parent().parent(), col;
				if (this.parentNode.className.indexOf('_hex') > 0) {
					cal.data('colourpicker').colour = col = HexToHSB(fixHex(this.value));
				} else if (this.parentNode.className.indexOf('_hsb') > 0) {
					cal.data('colourpicker').colour = col = fixHSB({
						h: parseInt(cal.data('colourpicker').fields.eq(4).val(), 10),
						s: parseInt(cal.data('colourpicker').fields.eq(5).val(), 10),
						b: parseInt(cal.data('colourpicker').fields.eq(6).val(), 10)
					});
				} else {
					cal.data('colourpicker').colour = col = RGBToHSB(fixRGB({
						r: parseInt(cal.data('colourpicker').fields.eq(1).val(), 10),
						g: parseInt(cal.data('colourpicker').fields.eq(2).val(), 10),
						b: parseInt(cal.data('colourpicker').fields.eq(3).val(), 10)
					}));
				}
				if (ev) {
					fillRGBFields(col, cal.get(0));
					fillHexFields(col, cal.get(0));
					fillHSBFields(col, cal.get(0));
				}
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColour(col, cal.get(0));
				cal.data('colourpicker').onChange.apply(cal, [col, HSBToHex(col), HSBToRGB(col)]);
			},
			blur = function (ev) {
				var cal = $(this).parent().parent();
				cal.data('colourpicker').fields.parent().removeClass('colourpicker_focus')
			},
			focus = function () {
				charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
				$(this).parent().parent().data('colourpicker').fields.parent().removeClass('colourpicker_focus');
				$(this).parent().addClass('colourpicker_focus');
			},
			downIncrement = function (ev) {
				var field = $(this).parent().find('input').focus();
				var current = {
					el: $(this).parent().addClass('colourpicker_slider'),
					max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
					y: ev.pageY,
					field: field,
					val: parseInt(field.val(), 10),
					preview: $(this).parent().parent().data('colourpicker').livePreview					
				};
				$(document).bind('mouseup', current, upIncrement);
				$(document).bind('mousemove', current, moveIncrement);
			},
			moveIncrement = function (ev) {
				ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
				if (ev.data.preview) {
					change.apply(ev.data.field.get(0), [true]);
				}
				return false;
			},
			upIncrement = function (ev) {
				change.apply(ev.data.field.get(0), [true]);
				ev.data.el.removeClass('colourpicker_slider').find('input').focus();
				$(document).unbind('mouseup', upIncrement);
				$(document).unbind('mousemove', moveIncrement);
				return false;
			},
			downHue = function (ev) {
				var current = {
					cal: $(this).parent(),
					y: $(this).offset().top
				};
				current.preview = current.cal.data('colourpicker').livePreview;
				$(document).bind('mouseup', current, upHue);
				$(document).bind('mousemove', current, moveHue);
			},
			moveHue = function (ev) {
				change.apply(
					ev.data.cal.data('colourpicker')
						.fields
						.eq(4)
						.val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upHue = function (ev) {
				fillRGBFields(ev.data.cal.data('colourpicker').colour, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colourpicker').colour, ev.data.cal.get(0));
				$(document).unbind('mouseup', upHue);
				$(document).unbind('mousemove', moveHue);
				return false;
			},
			downSelector = function (ev) {
				var current = {
					cal: $(this).parent(),
					pos: $(this).offset()
				};
				current.preview = current.cal.data('colourpicker').livePreview;
				$(document).bind('mouseup', current, upSelector);
				$(document).bind('mousemove', current, moveSelector);
			},
			moveSelector = function (ev) {
				change.apply(
					ev.data.cal.data('colourpicker')
						.fields
						.eq(6)
						.val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10))
						.end()
						.eq(5)
						.val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upSelector = function (ev) {
				fillRGBFields(ev.data.cal.data('colourpicker').colour, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colourpicker').colour, ev.data.cal.get(0));
				$(document).unbind('mouseup', upSelector);
				$(document).unbind('mousemove', moveSelector);
				return false;
			},
			enterSubmit = function (ev) {
				$(this).addClass('colourpicker_focus');
			},
			leaveSubmit = function (ev) {
				$(this).removeClass('colourpicker_focus');
			},
			clickSubmit = function (ev) {
				var cal = $(this).parent();
				var col = cal.data('colourpicker').colour;
				cal.data('colourpicker').origColour = col;
				setCurrentColour(col, cal.get(0));
				cal.data('colourpicker').onSubmit(col, HSBToHex(col), HSBToRGB(col));
			},
			show = function (ev) {
				var cal = $('#' + $(this).data('colourpickerId'));
				cal.data('colourpicker').onBeforeShow.apply(this, [cal.get(0)]);
				var pos = $(this).offset();
				var viewPort = getViewport();
				var top = pos.top + this.offsetHeight;
				var left = pos.left;
				if (top + 176 > viewPort.t + viewPort.h) {
					top -= this.offsetHeight + 176;
				}
				if (left + 356 > viewPort.l + viewPort.w) {
					left -= 356;
				}
				cal.css({left: left + 'px', top: top + 'px'});
				if (cal.data('colourpicker').onShow.apply(this, [cal.get(0)]) != false) {
					cal.show();
				}
				$(document).bind('mousedown', {cal: cal}, hide);
				return false;
			},
			hide = function (ev) {
				if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('colourpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
			},
			isChildOf = function(parentEl, el, container) {
				if (parentEl == el) {
					return true;
				}
				if (parentEl.contains) {
					return parentEl.contains(el);
				}
				if ( parentEl.compareDocumentPosition ) {
					return !!(parentEl.compareDocumentPosition(el) & 16);
				}
				var prEl = el.parentNode;
				while(prEl && prEl != container) {
					if (prEl == parentEl)
						return true;
					prEl = prEl.parentNode;
				}
				return false;
			},
			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
			},
			fixHSB = function (hsb) {
				return {
					h: Math.min(360, Math.max(0, hsb.h)),
					s: Math.min(100, Math.max(0, hsb.s)),
					b: Math.min(100, Math.max(0, hsb.b))
				};
			}, 
			fixRGB = function (rgb) {
				return {
					r: Math.min(255, Math.max(0, rgb.r)),
					g: Math.min(255, Math.max(0, rgb.g)),
					b: Math.min(255, Math.max(0, rgb.b))
				};
			},
			fixHex = function (hex) {
				var len = 6 - hex.length;
				if (len > 0) {
					var o = [];
					for (var i=0; i<len; i++) {
						o.push('0');
					}
					o.push(hex);
					hex = o.join('');
				}
				return hex;
			}, 
			HexToRGB = function (hex) {
				var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
				return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
			},
			HexToHSB = function (hex) {
				return RGBToHSB(HexToRGB(hex));
			},
			RGBToHSB = function (rgb) {
				var hsb = {};
				hsb.b = Math.max(Math.max(rgb.r,rgb.g),rgb.b);
				hsb.s = (hsb.b <= 0) ? 0 : Math.round(100*(hsb.b - Math.min(Math.min(rgb.r,rgb.g),rgb.b))/hsb.b);
				hsb.b = Math.round((hsb.b /255)*100);
				if((rgb.r==rgb.g) && (rgb.g==rgb.b)) hsb.h = 0;
				else if(rgb.r>=rgb.g && rgb.g>=rgb.b) hsb.h = 60*(rgb.g-rgb.b)/(rgb.r-rgb.b);
				else if(rgb.g>=rgb.r && rgb.r>=rgb.b) hsb.h = 60  + 60*(rgb.g-rgb.r)/(rgb.g-rgb.b);
				else if(rgb.g>=rgb.b && rgb.b>=rgb.r) hsb.h = 120 + 60*(rgb.b-rgb.r)/(rgb.g-rgb.r);
				else if(rgb.b>=rgb.g && rgb.g>=rgb.r) hsb.h = 180 + 60*(rgb.b-rgb.g)/(rgb.b-rgb.r);
				else if(rgb.b>=rgb.r && rgb.r>=rgb.g) hsb.h = 240 + 60*(rgb.r-rgb.g)/(rgb.b-rgb.g);
				else if(rgb.r>=rgb.b && rgb.b>=rgb.g) hsb.h = 300 + 60*(rgb.r-rgb.b)/(rgb.r-rgb.g);
				else hsb.h = 0;
				hsb.h = Math.round(hsb.h);
				return hsb;
			},
			HSBToRGB = function (hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s*255/100);
				var v = Math.round(hsb.b*255/100);
				if(s == 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255-s)*v/255;
					var t3 = (t1-t2)*(h%60)/60;
					if(h==360) h = 0;
					if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
					else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
					else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
					else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
					else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
					else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
					else {rgb.r=0; rgb.g=0;	rgb.b=0}
				}
				return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
			},
			RGBToHex = function (rgb) {
				var hex = [
					rgb.r.toString(16),
					rgb.g.toString(16),
					rgb.b.toString(16)
				];
				$.each(hex, function (nr, val) {
					if (val.length == 1) {
						hex[nr] = '0' + val;
					}
				});
				return hex.join('');
			},
			HSBToHex = function (hsb) {
				return RGBToHex(HSBToRGB(hsb));
			};
		return {
			init: function (options) {
				options = $.extend({}, defaults, options||{});
				if (typeof options.colour == 'string') {
					options.colour = HexToHSB(options.colour);
				} else if (options.colour.r != undefined && options.colour.g != undefined && options.colour.b != undefined) {
					options.colour = RGBToHSB(options.colour);
				} else if (options.colour.h != undefined && options.colour.s != undefined && options.colour.b != undefined) {
					options.colour = fixHSB(options.colour);
				} else {
					return this;
				}
				options.origColour = options.colour;
				return this.each(function () {
					if (!$(this).data('colourpickerId')) {
						var id = 'collorpicker_' + parseInt(Math.random() * 1000);
						$(this).data('colourpickerId', id);
						var cal = $(tpl).attr('id', id);
						if (options.flat) {
							cal.appendTo(this).show();
						} else {
							cal.appendTo(document.body);
						}
						options.fields = cal
											.find('input')
												.bind('keydown', keyDown)
												.bind('change', change)
												.bind('blur', blur)
												.bind('focus', focus);
						cal.find('span').bind('mousedown', downIncrement);
						options.selector = cal.find('div.colourpicker_colour').bind('mousedown', downSelector);
						options.selectorIndic = options.selector.find('div div');
						options.hue = cal.find('div.colourpicker_hue div');
						cal.find('div.colourpicker_hue').bind('mousedown', downHue);
						options.newColour = cal.find('div.colourpicker_new_colour');
						options.currentColour = cal.find('div.colourpicker_current_colour');
						cal.data('colourpicker', options);
						cal.find('div.colourpicker_submit')
							.bind('mouseenter', enterSubmit)
							.bind('mouseleave', leaveSubmit)
							.bind('click', clickSubmit);
						fillRGBFields(options.colour, cal.get(0));
						fillHSBFields(options.colour, cal.get(0));
						fillHexFields(options.colour, cal.get(0));
						setHue(options.colour, cal.get(0));
						setSelector(options.colour, cal.get(0));
						setCurrentColour(options.colour, cal.get(0));
						setNewColour(options.colour, cal.get(0));
						if (options.flat) {
							cal.css({
								position: 'relative',
								display: 'block'
							});
						} else {
							$(this).bind(options.eventName, show);
						}
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('colourpickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('colourpickerId')) {
						$('#' + $(this).data('colourpickerId')).hide();
					}
				});
			},
			setColour: function(col) {
				if (typeof col == 'string') {
					col = HexToHSB(col);
				} else if (col.r != undefined && col.g != undefined && col.b != undefined) {
					col = RGBToHSB(col);
				} else if (col.h != undefined && col.s != undefined && col.b != undefined) {
					col = fixHSB(col);
				} else {
					return this;
				}
				return this.each(function(){
					if ($(this).data('colourpickerId')) {
						var cal = $('#' + $(this).data('colourpickerId'));
						cal.data('colourpicker').colour = col;
						cal.data('colourpicker').origColour = col;
						fillRGBFields(col, cal.get(0));
						fillHSBFields(col, cal.get(0));
						fillHexFields(col, cal.get(0));
						setHue(col, cal.get(0));
						setSelector(col, cal.get(0));
						setCurrentColour(col, cal.get(0));
						setNewColour(col, cal.get(0));
					}
				});
			}
		};
	}();
	$.fn.extend({
		ColourPicker: ColourPicker.init,
		ColourPickerHide: ColourPicker.hide,
		ColourPickerShow: ColourPicker.show,
		ColourPickerSetColour: ColourPicker.setColour
	});
})(jQuery)