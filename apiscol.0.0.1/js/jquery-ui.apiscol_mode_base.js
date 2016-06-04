(jQuery);
(function($) {
	$
			.widget(
					"ui.apiscol_mode_base",
					$.ui.apiscol_mode_all,
					{
						defaults : {
							styleSheetName : "apiscol.screen.base.css",
							hoverEffect : false
						},
						decorateInterface : function() {
							var self = this;
							this.loadApiscolStyleSheet(
									this.defaults.styleSheetName, $.proxy(
											self.processTags, self));
						},
						processTags : function() {
							var self = this;
							$(".apiscol-notice").addClass(
									"ui-widget ui-helper-reset");
							$(
									"div.main-content div#presentation header section.icon-container",
									this.options.apiscol.rId).insertAfter(
									$("header h1", this.options.apiscol.rId));
							$(
									"div.main-content div#presentation header section.authors ",
									this.options.apiscol.rId).insertAfter(
									$("header h1", this.options.apiscol.rId));
							$(
									"div.main-content div#presentation section.desc-container span.description span",
									this.options.apiscol.rId).insertAfter(
									$("header", this.options.apiscol.rId))
									.addClass("desc-container");
							$(
									"div.main-content div#presentation section.desc-container div.thumb",
									this.options.apiscol.rId).insertBefore(
									$("header", this.options.apiscol.rId));
							$(".main-content", this.options.apiscol.rId)
									.remove();
							$(".level-container", this.options.apiscol.rId)
									.remove();
							$(".preview-container", this.options.apiscol.rId)
									.remove();
							$(".classifications", this.options.apiscol.rId)
									.remove();
							$(".apiscol-notice")
									.addClass("ui-helper-reset apiscol-base")
									.addClass(
											this.options.hoverEffect ? "apiscol-condensed"
													: "apiscol-expanded ui-widget-content ui-helper-clearfix")
									.removeClass("ui-state-error");
							this.convertDownloadLinkToButton();
							this.addBubblesToMetadataIcons();
							if (this.options.hoverEffect)
								this.container
										.mouseover(
												this.handleMouseOverMiniNotice)
										.mouseout(this.handleMouseOutMiniNotice);
							self.filterAuthors();
							this.options.apiscol.displayNotice(true);
						},
						handleMouseOverMiniNotice : function() {
							$(".apiscol-notice")
									.removeClass("apiscol-condensed")
									.addClass(
											"apiscol-expanded ui-widget-content ui-helper-clearfix");
						},
						handleMouseOutMiniNotice : function() {
							$(".apiscol-notice")
									.addClass("apiscol-condensed")
									.removeClass(
											"apiscol-expanded ui-widget-content ui-helper-clearfix");
						},

						destroy : function() {

						}
					});
})(jQuery);
