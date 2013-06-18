(jQuery);
(function($) {
	$
			.widget(
					"ui.apiscol_mode_all",
					{
						defaults : {
							jqueryBubblePopupCSS : "jquery-bubble-popup/css/jquery-bubble-popup-v3.css",
							jqueryBubblePopupJsUri : "jquery-bubble-popup/scripts/jquery-bubble-popup-v3.min.js",
							jqueryCSSurlPattern : "http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/themes/STYLE/jquery-ui.css",
							apiscolCdnCSSPath : "VERSION/css/"
						},
						_create : function() {
							this.container = $(this.element);
							$(document)
									.click(
											function(event) {
												if ($(event.target).closest(
														".ui-combobox-toggle").length > 0)
													return;
												$(".ui-autocomplete:visible")
														.hide();
											});
							var self = this;
							var parentOptions = this.options.apiscol.options;
							$("img.metadata-icon", this.options.apiscol.rId)
									.each(
											function(index, elem) {
												var title = $(elem).attr(
														"title");
												$(elem)
														.attr(
																"title",
																self
																		.resolveHtmlEntities(title));
											});
							$("img.metadata-icon+span",
									this.options.apiscol.rId).each(
									function(index, elem) {
										$(elem).html($(elem).text());
									});
							this.options = $.extend({}, this.defaults,
									parentOptions, this.options);
							this.loadJQueryBubbleStyleSheet();
						},
						resolveHtmlEntities : function(encodedStr) {
							return $("<div/>").html(encodedStr).text();
						},
						loadScriptsPhase : function() {
							this.options.apiscol.planifyScriptLoading
									.call(
											this.options.apiscol,
											{
												url : this.options.cdn
														+ this.options.jqueryBubblePopupJsUri,
												property : "CreateBubblePopup",
												callback : this.decorateInterface,
												context : this,
												prefix : "fn"
											});
							this.options.apiscol.goOnLoadingScript
									.call(this.options.apiscol);
						},
						option : function(key, value) {
							var rebuild = false;
							switch (key) {
							case "style":
								this.options.style = value;
								this.loadJqueryUiStyleSheet($.noop);
								break;
							case "url":
								console.log(key, value);
								break;
							case "mode":
								console.log(key, value);
								break;
							}

							$.Widget.prototype._setOption
									.apply(this, arguments)
						},
						loadJQueryBubbleStyleSheet : function() {
							var self = this;
							this.options.apiscol
									.createStyleSheetLinkTag(
											self.options.cdn
													+ self.options.jqueryBubblePopupCSS,
											$.proxy(self.loadJQueryUiCSS, self));
						},
						loadJQueryUiCSS : function() {
							var self = this;
							if (this.options.style == "inherit")
								self.loadScriptsPhase();
							else
								self.loadJqueryUiStyleSheet($.proxy(
										self.loadScriptsPhase, self));
						},
						loadApiscolStyleSheet : function(styleSheetName,
								callback) {
							this.options.apiscol
									.createStyleSheetLinkTag(
											this.options.cdn
													+ this.options.apiscolCdnCSSPath
															.replace(
																	/VERSION/,
																	this.options.apiscol.options.version)
													+ styleSheetName, callback);
						},
						loadJqueryUiStyleSheet : function(callback) {
							this.options.style = this.options.jqueryCSSurlPattern
									.replace("STYLE", this.options.style);
							if (this.styleSheetLink)
								this.styleSheetLink.remove();
							this.styleSheetLink = this.options.apiscol
									.createStyleSheetLinkTag(
											this.options.style, callback);
						},
						convertDownloadLinkToButton : function() {
							var downloadIcon = "ui-icon-extlink";
							$(".download", this.options.apiscol.rId).addClass(
									"ui-state-highlight ui-corner-all").button(
									{
										icons : {
											primary : downloadIcon
										}
									});
						},
						addBubblesToMetadataIcons : function() {
							var self = this;
							$(".icon-container>img", this.options.apiscol.rId)
									.each(
											function(index, item) {
												var title = $(item).attr(
														"title");
												$(item)
														.attr("title", "")
														.CreateBubblePopup(
																{
																	innerHtml : title,
																	themePath : self.options.cdn
																			+ "/jquery-bubble-popup/jquerybubblepopup-themes",
																	width : "130px",
																	position : "top",
																	align : "center",
																	themeName : "yellow",
																	innerHtmlStyle : {
																		"font-size" : "14px"
																	}
																});
											});
						},
						filterAuthors : function() {
							var self = this;
							var $authorsSection = $("section.authors",
									this.options.apiscol.rId);
							var $authorsWrapper = $(
									document.createElement("span"))
									.addClass(
											"authors-wrapper ui-widget-content ui-state-default ui-corner-all ui-helper-reset")
									.append(
											$("<span><strong>Auteurs</strong></span>"))
									.appendTo($authorsSection);
							var addPoints = false;
							var atLeastOneAuthor = false;
							$authorsSection
									.children(".label")
									.each(
											function(index, elem) {
												if ($(elem)
														.attr("data-role")
														.match(
																/author|auteur|creator/)) {
													atLeastOneAuthor = true;
													$(elem)
															.removeClass(
																	"label")
															.addClass("vcard");
													if (index < self.options.nb_max_authors_displayed + 1) {
														$(elem)
																.appendTo(
																		$authorsWrapper);
														$(elem).html(
																$(elem).text());
													}

													else {
														$(elem).remove();
														addPoints = true;
													}
													var date = $(elem).attr(
															"dateTime");
													if (!self.options.apiscol
															.isVoid(date))
														var $date = $(
																document
																		.createElement("span"))
																.html(
																		"&nbsp;("
																				+ date
																				+ ")")
																.appendTo(
																		$authorsWrapper);
												} else
													$(elem).remove();
											});
							if (!atLeastOneAuthor)
								$authorsSection.hide();
							else if (addPoints)
								$authorsWrapper.append($(
										document.createElement("span")).text(
										"..."));
						},
						downLoadSnippetInfo : function(snippetUrl) {
							var self = this;
							$.jsonp({
								url : snippetUrl
										+ "?format=application/javascript",
								callback : "callback",
								context : self,
								success : self.handleSnippetInfoArrival
							});
						},
						handleSnippetInfoArrival : function(data) {
							if (!this.snippetPopup)
								this.createSnippetPopup(data);
							this.snippetPopup.dialog('open');
						},
						buildShareButtons : function() {
							var self = this;
							var snippetLink = $('#share-ApiScol',
									this.options.apiscol.rId);
							var snippetButton = $(
									document.createElement("button")).attr(
									"id", "share-button");
							snippetLink.wrap(snippetButton);
							this.snippetSourceUrl = snippetLink.attr("href");
							$('#share-button', this.options.apiscol.rId)
									.button({
										text : false,
										icons : {
											primary : "ui-icon-apiscol"
										}
									})
									.click(
											$
													.proxy(
															self.handleSnippetLinkClick,
															self))
									.next()
									.button({
										text : false,
										icons : {
											primary : "ui-icon-triangle-1-s"
										}
									})
									.click(
											function() {
												var menu = $(this)
														.parent()
														.next()
														.show()
														.width(
																$(this).width() * 0.75)
														.position(
																{
																	my : "center top",
																	at : "center bottom",
																	of : this
																});
												$(document).one("click",
														function() {
															menu.hide();
														});
												return false;
											}).parent().buttonset().next()
									.hide().menu();

						},
						handleSnippetLinkClick : function(event) {
							this.downLoadSnippetInfo(this.snippetSourceUrl);
							event.preventDefault();
						},
						createSnippetPopup : function(data) {
							var width = parseInt(this.container.width() * 0.8);
							this.snippetPopup = this.buildSnippetPopup(data)
									.dialog({
										autoOpen : false,
										width : width,
										show : "slide",
										hide : "slide"
									});

						},
						buildSnippetPopup : function(data) {
							this.snippetData = data;
							var self = this;
							self.options.snippetDialogId = "dialog"
									+ self.options.apiscol.id;
							self.options.snippetDialogrefId = "#"
									+ self.options.snippetDialogId;
							self.snippetOptions = {
								iframe : false,
								apiscolScriptIncluded : true,
								jqueryScriptIncluded : false,
								mode : "full",
								device : "auto",
								style : "redmond"
							};
							var root = $(document.createElement("div"))
									.addClass("apiscol-snippet").attr("title",
											"Cette ressource dans votre site")
									.attr("id", self.options.snippetDialogId)
									.appendTo($("body"));
							$(document)
									.bind(
											"click",
											function(e) {
												if ($(e.target)
														.closest(
																'.ui-dialog, .ui-autocomplete').length == 0
														&& root
																.dialog("isOpen"))
													root.dialog("close");
											});
							var optionsContainer = $(
									document.createElement("div")).addClass(
									"snippet-options-bar").appendTo(root);
							this.iFrameOption = $(
									'<input type="checkbox" id="checkboxiframe" /><label for="checkboxiframe">Utiliser un iframe</label>')
									.button({
										text : false,
										icons : {
											primary : "ui-icon-iframe"
										}
									})
									.toggleClass("ui-state-disabled",
											!self.snippetOptions.iframe)
									.click(
											function() {
												$(this).toggleClass(
														"ui-state-disabled");
												var enabled = !$(this)
														.hasClass(
																"ui-state-disabled");
												self.snippetOptions.iframe = enabled;

												self.updateToolBar();

												self.updateSnippet();
											}).appendTo(optionsContainer);
							this.modeDisplayer = $(
									"<span class=\"snippet-option-displayer ui-state-highlight\"></span>")
									.appendTo(optionsContainer);
							var modeSelectorContainer = this
									.createComboForOption("MODE",
											self.snippetOptions.mode, data,
											optionsContainer).bind(
											"selected",
											function() {
												self.snippetOptions.mode = $(
														this).val();
												self.updateToolBar();
												self.updateSnippet();
											});
							this.styleDisplayer = this.modeDisplayer.clone()
									.appendTo(optionsContainer);
							var styleSelectorContainer = this
									.createComboForOption("STYLE",
											self.snippetOptions.style, data,
											optionsContainer).bind(
											"selected",
											function() {
												self.snippetOptions.style = $(
														this).val();
												self.updateToolBar();
												self.updateSnippet();
											});
							this.deviceDisplayer = this.modeDisplayer.clone()
									.appendTo(optionsContainer);
							var deviceSelectorContainer = this
									.createComboForOption("DEVICE",
											self.snippetOptions.device, data,
											optionsContainer).bind(
											"selected",
											function() {
												self.snippetOptions.device = $(
														this).val();
												self.updateToolBar();
												self.updateSnippet();
											});
							this.jqueryOption = $(
									'<input type="checkbox" id="checkboxjquery" /><label for="checkboxjquery">Intégrer jQuery</label>')
									.button({
										text : false,
										icons : {
											primary : "ui-icon-jquery"
										}
									})
									.toggleClass(
											"ui-state-disabled",
											!self.snippetOptions.jqueryScriptIncluded)
									.click(
											function() {
												$(this).toggleClass(
														"ui-state-disabled");
												self.snippetOptions.jqueryScriptIncluded = !$(
														this).hasClass(
														"ui-state-disabled");
												self.updateSnippet();
											}).appendTo(optionsContainer);
							this.apiscolOption = $(
									'<input type="checkbox" id="checkboxapiscol" /><label for="checkboxapiscol">Intégrer le script ApiScol</label>')
									.button({
										text : false,
										icons : {
											primary : "ui-icon-apiscol"
										}
									})
									.toggleClass(
											"ui-state-disabled",
											!self.snippetOptions.apiscolScriptIncluded)
									.click(
											function() {

												$(this).toggleClass(
														"ui-state-disabled");
												self.snippetOptions.apiscolScriptIncluded = !$(
														this).hasClass(
														"ui-state-disabled");
												self.updateSnippet();
											}).appendTo(optionsContainer);
							var snippetContainer = $(
									document.createElement("div")).addClass(
									"ui-widget-content").appendTo(root);
							this.snippetArea = $(
									document.createElement("textarea"))
									.appendTo(snippetContainer);
							this.updateToolBar();
							this.updateSnippet();
							return root;
						},
						updateToolBar : function() {

							this.jqueryOption
									.toggle(!this.snippetOptions.iframe);
							this.apiscolOption
									.toggle(!this.snippetOptions.iframe);
							this.modeDisplayer.text("Mode : "
									+ this.snippetOptions.mode);
							this.deviceDisplayer.text("Ecran : "
									+ this.snippetOptions.device);
							this.styleDisplayer.text("Style : "
									+ this.snippetOptions.style);
						},
						updateSnippet : function() {
							var snippet = "";
							if (!this.snippetOptions.iframe) {
								if (this.snippetOptions.jqueryScriptIncluded)
									snippet += this.snippetData["apiscol:framewok"];
								if (this.snippetOptions.apiscolScriptIncluded)
									snippet += this.snippetData["apiscol:script"];
								snippet += this.snippetData["apiscol:tag-pattern"]

							} else {
								snippet += this.snippetData["apiscol:iframe"];
							}
							snippet = snippet.replace("STYLE",
									this.snippetOptions.style).replace("MODE",
									this.snippetOptions.mode).replace("DEVICE",
									this.snippetOptions.device);
							this.snippetArea.text(snippet);
						},
						createComboForOption : function(option, selected, data,
								container) {
							var comboContainer = $(
									document.createElement("span")).appendTo(
									container);
							var selectorContainer = $(
									document.createElement("select")).appendTo(
									comboContainer);
							var options = this.getOptionByToken(
									data["apiscol:options"]["apiscol:options"],
									option);
							for ( var int = 0; int < options["apiscol:value"].length; int++) {
								var value = options["apiscol:value"][int];
								var isSelected = value == selected;
								var opt = $(document.createElement("option"))
										.attr("value", value).text(
												options["apiscol:value"][int])
										.appendTo(selectorContainer);
								if (isSelected)
									opt.attr("selected", "selected")
							}
							return selectorContainer.combobox();
						},
						getOptionByToken : function(options, token) {
							for ( var int = 0; int < options.length; int++) {
								if (options[int]["@token"] == token)
									return options[int];
							}
						},
						parseIsoDuration : function(string) {
							var regexp = /P?((\d+)Y)?((\d+)M)?((\d+)D)?T?((\d+)H)?((\d+)M)?((\d+)\.?(\d+)?S)?/;
							return regexp.exec(string);
						},
						formatDuration : function(array) {
							var y = array[2], m = array[4], d = array[6], h = array[8], mn = array[10], s = array[12];
							return ((y && y > 0) ? y + " an"
									+ (y > 1 ? "s " : " ") : "")
									+ (m && m > 0 ? m + " mois " : "")
									+ (d && d > 0 ? d + " jour"
											+ (d > 1 ? "s " : " ") : "")
									+ (h > 0 ? h + " heure"
											+ (h > 1 ? "s " : " ") : "")
									+ (mn && mn > 0 ? mn + " minute"
											+ (mn > 1 ? "s " : " ") : "")
									+ (s && s > 0 ? s + " seconde"
											+ (s > 1 ? "s" : " ") : "")
						},
						formatSizeInKo : function(size) {
							if (parseInt(size) == 0)
								return "N/A";
							size = parseInt(size);
							if (size < 1024)
								return parseInt(size) + " Ko";
							if (size < 1048576)
								return parseInt(size / 1024) + ","
										+ parseInt(size % 1024) + " Mo";
							return parseInt(size / 1048576) + ","
									+ parseInt(size % 1048576) + "Go";
						}
					});
	$
			.widget(
					"ui.combobox",
					{
						_create : function() {
							var input, self = this, select = this.element
									.hide(), selected = select
									.children(":selected"), value = selected
									.val() ? selected.text() : "", wrapper = this.wrapper = $(
									"<span>").addClass("ui-combobox")
									.insertAfter(select);

							input = $("<input>")
									.appendTo(wrapper)
									.attr("disabled", "true")
									.val(value)
									.addClass(
											"ui-state-default ui-combobox-input")
									.autocomplete(
											{
												delay : 0,
												minLength : 0,
												source : function(request,
														response) {
													response(select
															.children("option")
															.map(
																	function() {
																		var text = $(
																				this)
																				.text();
																		return {
																			label : text,
																			value : text,
																			option : this
																		};
																	}));
												},
												select : function(event, ui) {
													ui.item.option.selected = true;
													// HACK
													$(self.element)
															.trigger(
																	"selected",
																	event,
																	{
																		item : ui.item.option
																	});
												}
											})
									.addClass(
											"ui-widget ui-widget-content ui-corner-left");

							$("<a>")
									.attr("tabIndex", -1)
									.attr("title", "Show All Items")
									.appendTo(wrapper)
									.button({
										icons : {
											primary : "ui-icon-triangle-1-s"
										},
										text : false
									})
									.removeClass("ui-corner-all")
									.addClass(
											"ui-corner-right ui-combobox-toggle")
									.click(
											function() {
												// close if already visible
												if (input
														.autocomplete("widget")
														.is(":visible")) {
													input.autocomplete("close");
													return;
												}

												// work around a bug (likely
												// same cause as #5265)
												$(this).blur();

												// pass empty string as value to
												// search for, displaying all
												// results
												input
														.autocomplete("search",
																"");
												input.focus();
											});
						},

						destroy : function() {
							this.wrapper.remove();
							this.element.show();
							$.Widget.prototype.destroy.call(this);
						}
					});

})(jQuery);
