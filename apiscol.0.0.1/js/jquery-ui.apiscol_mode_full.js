(jQuery);
(function($) {
	$
			.widget(
					"ui.apiscol_mode_full",
					$.ui.apiscol_mode_all,
					{
						defaults : {
							styleSheetName : "apiscol.screen.full.css",
							jqueryMenuCss : "jquery-menu/fg.menu.css",
							jqueryMenuJs : "jquery-menu/fg.menu.js"
						},
						decorateInterface : function() {
							var self = this;
							this.loadApiscolStyleSheet(
									this.defaults.styleSheetName, $.proxy(
											self.processTags, self));
						},
						loadjQueryMenuJs : function() {
							this.options.apiscol.planifyScriptLoading.call(
									this.options.apiscol, {
										url : this.options.cdn
												+ this.options.jqueryMenuJs,
										property : "menumark",
										callback : this.loadJQueryMenuCss,
										context : this,
										prefix : "fn"
									});
							this.options.apiscol.goOnLoadingScript
									.call(this.options.apiscol);
						},
						loadJQueryMenuCss : function() {
							var self = this;
							this.options.apiscol.createStyleSheetLinkTag(
									self.options.cdn
											+ self.options.jqueryMenuCss, $
											.proxy(self.processTags, self));
						},
						processTags : function() {
							var self = this;
							$(".apiscol-notice")
									.addClass(
											"apiscol-full ui-widget ui-widget-content ui-helper-reset ui-helper-clearfix")
									.removeClass("ui-state-error");

							$(".tag", this.options.apiscol.rId)
									.addClass(
											"ui-widget-content ui-corner-all  ui-helper-reset");
							$(".description", this.options.apiscol.rId)
									.addClass("ui-helper-reset");
							$(".apiscol-notice>header")
									.addClass(
											"ui-corner-top ui-helper-reset ui-helper-clearfix");
							$(".apiscol-notice header h1").addClass(
									"ui-helper-reset");
							$("#presentation>header", this.options.apiscol.rId)
									.addClass(
											"ui-helper-reset ui-helper-clearfix");
							$(".level-container>h2").addClass(
									"ui-widget-content ui-helper-reset");
							$(".thumb", this.options.apiscol.rId).addClass(
									"ui-widget-content ui-corner-all");

							if (this.options.apiscol
									.isVoid(this.options.apiscol.snippetUrl))
								$(".snippet-link").remove();
							this.buildShareButtons();
							var thumbExists = false;
							if ($(".thumb", this.options.apiscol.rId).length > 0) {
								thumbExists = true;
								var $img = $(".thumb img",
										this.options.apiscol.rId);
								var $thumb = $(".thumb",
										this.options.apiscol.rId);
								$img.load(function() {
									$thumb.width($img.width());
									$thumb.height($img.height());
									var thumbHeight = $thumb.height;
									var thumbWidth = $thumb.width;
									var lineHeight = parseInt($(
											".desc-container", self.rId).css(
											'line-height'));
									$(".desc-container span.description span",
											self.rId).height(thumbHeight);

								});
								$img.attr("src", $img.attr("src"));
							}

							this.convertDownloadLinkToButton();
							if (this.options.closeButton)
								$(".download", this.options.apiscol.rId)
										.after(
												$(
														document
																.createElement("span"))
														.button(
																{
																	text : false,
																	icons : {
																		primary : "ui-icon-circle-close"
																	}
																})
														.click(
																function(e) {
																	$(
																			self.options.apiscol.originalElement)
																			.trigger(
																					'close');
																}));
							$(".download-unavailable", this.options.apiscol.rId)
									.addClass("ui-state-error ui-corner-all");
							this.addBubblesToMetadataIcons();
							$(".details", this.options.apiscol.rId).addClass(
									"ui-corner-all ui-widget-content");

							$("div.main-content")
									.tabs()
									.bind(
											"tabsselect",
											function(e, ui) {
												if (ui.panel.id == "rights")
													self
															.uniformizeRoleLabelsWidth();
												if (ui.panel.id == "technical")
													self
															.uniformizeSizeAndDurationLabels();
											});

							$(".main-content", this.options.apiscol.rId)
									.addClass(
											"ui-helper-clearfix ui-corner-bottom")
									.removeClass("ui-corner-all");
							$educationalDurationContainer = $(
									"div#educational section.summary span.duration span",
									this.options.apiscol.rId);
							var educationalDurationIsoString = $educationalDurationContainer
									.text();
							$educationalDurationContainer
									.text(this
											.formatDuration(this
													.parseIsoDuration(educationalDurationIsoString)));
							var nbKeyWords = $(".classifications",
									this.options.apiscol.rId).children("span").length;
							if (nbKeyWords > 0)
								$(".classifications", this.options.apiscol.rId)
										.addClass("ui-state-highlight")
							else
								$(".classifications", this.options.apiscol.rId)
										.remove();
							$(" div#rights li span.role-label",
									this.options.apiscol.rId).addClass(
									"ui-state-active ui-corner-all");
							// to fix special chars problems
							$(" div#rights li span.role-label",
									this.options.apiscol.rId).next("ul")
									.children("li").each(function() {
										$(this).html($(this).text());
									});
							$(" div#rights .licence", this.options.apiscol.rId)
									.addClass(
											"ui-state-active ui-corner-all ui-helper-clearfix");

							$(".duration", this.options.apiscol.rId).addClass(
									"ui-state-active ui-corner-all").prepend(
									$('<span class="clock"></span>')

							);
							$(".size", this.options.apiscol.rId).addClass(
									"ui-state-active ui-corner-all").prepend(
									$('<span class="weight"></span>')

							);
							var previewUrl = $(".preview-area>a",
									this.options.apiscol.rId).attr("href");
							if (previewUrl != "undefined")
								$
										.jsonp({
											url : previewUrl+ ".js",
											callback : "preview" ,
											context : self,
											success : function(data) {
												$(
														".preview-area",
														self.options.apiscol.rId)
														.empty().append(
																$(data.html));
												$(
														".preview-area .preview-widget",
														self.options.apiscol.rId)
														.hide();
												var $previewIcon = $(
														document
																.createElement("a"))
														.addClass(
																"preview-link")
														.button(
																{
																	text : false,
																	icons : {
																		primary : "ui-con-preview"
																	}
																});
												if (thumbExists) {
													$previewIcon
															.appendTo($(
																	".thumb",
																	self.options.apiscol.rId));

												} else
													// if we don't have a thumb,
													// we
													// append the
													// preview icon directly to
													// the
													// parent span
													$previewIcon
															.insertBefore($(
																	"span.description>span>strong",
																	self.options.apiscol.rId));
												// if no thumb, listen to the
												// click
												// on the preview
												var previewClickTarget = thumbExists ? $(
														".thumb",
														self.options.apiscol.rId)
														: $(
																".preview-link",
																self.options.apiscol.rId);
												previewClickTarget
														.bind(
																"click",
																$
																		.proxy(
																				self.togglePreviewArea,
																				self));

											},
											error : function() {
												$(
														".preview-area>a",
														self.options.apiscol.rId)
														.remove();
											}
										});
							self.filterAuthors();
							if (!this.waitingForThumb)
								this.uniformizeTabHeight();

							this.options.apiscol.displayNotice(true);
						},

						calculateLineHeight : function(elem) {
							return parseInt(elem.css("line-height"))
									+ parseInt(elem.css("padding-top"))
									+ parseInt(elem.css("padding-bottom"))
									+ parseInt(elem.css("margin-top"))
									+ parseInt(elem.css("margin-bottom"))
									+ parseInt(elem.css("border-top-width"))
									+ parseInt(elem.css("border-bottom-width"));
						},
						uniformizeTabHeight : function() {
							this.waitingForThumb = false;
							$(".main-content .ui-tabs-panel").not(
									"#presentation").css('height',
									$("#presentation").get(0).offsetHeight);
							$(".main-content .ui-tabs-panel").not(
									"#presentation").css('height',
									$("#presentation").get(0).offsetHeight);

						},
						uniformizeRoleLabelsWidth : function() {
							var self = this;
							if (!this.rightsLabelAreUniformized)
								setTimeout(
										function() {
											var maxWidth = 0;
											$(".role-label",
													self.options.apiscol.rId)
													.each(
															function(i, e) {
																maxWidth = Math
																		.max(
																				maxWidth,
																				$(
																						e)
																						.get(
																								0).offsetWidth);

															})
											$(".role-label",
													self.options.apiscol.rId)
													.width(maxWidth);
											self.rightsLabelAreUniformized = true;
										}, 100)
						},
						uniformizeSizeAndDurationLabels : function() {
							var self = this;
							if (!this.sizeAndDurationUniformized)
								setTimeout(function() {
									var maxWidth = 0;
									var collection = $(".duration",
											$("#technical")).add(
											$(".size", $("#technical")));
									collection.each(function(i, e) {
										maxWidth = Math.max(maxWidth, $(e).get(
												0).offsetWidth);

									})
									collection.width(maxWidth);
									self.sizeAndDurationUniformized = true;
								}, 100)
						},
						togglePreviewArea : function(event, ui) {
							var self = this;
							event.preventDefault();

							if (!$(".preview-link", this.options.apiscol.rId)
									.hasClass("preview-button")) {
								$previewArea = $(".preview-area",
										this.options.apiscol.rId);
								$previewArea
										.height(400)

										.width("100%")
										.hide()
										.slideDown(
												'slow',
												function() {
													if (!$previewArea
															.hasClass("activated")) {
														$(
																".preview-area .preview-widget",
																self.options.apiscol.rId)
																.show();
														if (typeof activatePreview != 'function')
															return;
														activatePreview($(
																".preview-area .preview-widget",
																self.options.apiscol.rId)
																.attr("id"));

													} else {
														if (typeof reactivatePreview != 'function')
															return;
														reactivatePreview($(
																".preview-area .preview-widget",
																self.options.apiscol.rId)
																.attr("id"));
													}
												});

							} else {

								$(".preview-area", this.options.apiscol.rId)
										.height(400)
										.width("100%")
										.slideUp(
												'fast',
												(typeof deactivatePreview === 'function') ? deactivatePreview
														: $.noop())
							}
							$(".preview-link", this.options.apiscol.rId)
									.toggleClass("preview-button");

						},

						destroy : function() {

						},

						setOption : function(key, value) {
							$.Widget.prototype._setOption
									.apply(this, arguments)
						}
					});

})(jQuery);