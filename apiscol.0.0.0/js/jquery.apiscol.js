;
(function($, window, document, undefined) {
	var pluginName = "apiscol";
	var defaults = {
		apiscolDisplayModesPattern : "VERSION/js/jquery-FRAMEWORK.apiscol_mode_MODE.js",
		cdn : "http://apiscol.crdp-versailles.fr/cdn/",
		waiterPath : "VERSION/img/wait.gif",
		backgroundColor : "#000",
		url : "",
		width : 800,
		height : 600,
		style : "redmond",
		mode : "full",
		device : "screen",
		UILanguage : "fr",
		nb_max_authors_displayed : 3,
		version : "version-token",
		closeButton : false
	};
	var frameworkForDevice = {
		screen : "ui",
		mobile : "mobile",
		// TODO change it
		auto : "ui"
	}
	var scripts = {
		jsonp : {
			url : "http://cloud.github.com/downloads/jaubourg/jquery-jsonp/jquery.jsonp-2.4.0.min.js",
			property : "jsonp",
			prefix : null
		},
		ui : {
			// TODO remettre min
			url : "http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.js",
			property : "ui",
			prefix : null
		}
	}

	function Apiscol(element, options) {
		this.originalElement =this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		$.ajaxSetup({
			cache : true
		});

		this.init();
	}

	Apiscol.prototype = {
		init : function() {
			this.createWaiter();
			this.catchUrl();
			// this.extractOptionsFromDataAttributes("data-device", "device");
			this.extractOptionsFromDataAttributes("data-mode", "mode");
			this.extractOptionsFromDataAttributes("data-style", "style");
			this.extractOptionsFromDataAttributes("href", "url");
			this.organizeScriptLoading();
			this.generateId();
			this.goOnLoadingScript();
		},
		catchUrl : function() {
			var url = $(this.element).attr("href");
			if (!url)
				return;
			this.options.url = url;
		},
		createWaiter : function() {
			this.waiter = $(document.createElement("img")).attr(
					"src",
					this.options.cdn
							+ this.options.waiterPath.replace(/VERSION/,
									this.options.version)).addClass("waiter")
					.appendTo($(this.element));

		},
		organizeScriptLoading : function() {

			this.planifyScriptLoading(scripts.jsonp);
			switch (frameworkForDevice[this.options.device]) {
			case "ui":
				this.planifyScriptLoading(scripts.ui)
				break;
			case "mobile":
				this.planifyScriptLoading(scripts.mobile)
				break;
			}
			var baseModeUrl = this.getModeScriptUrl("all");
			this.planifyScriptLoading({
				url : baseModeUrl,
				property : "apiscol_mode_all",
				prefix : "ui"
			});
			var specificModeUrl = this.getModeScriptUrl(this.options.mode);
			this.planifyScriptLoading({
				url : specificModeUrl,
				property : "apiscol_mode_" + this.options.mode,
				callback : this.handleTags,
				prefix : "ui"
			});
		},
		planifyScriptLoading : function(scriptParams) {
			if (!this.scriptsToBeLoaded)
				this.scriptsToBeLoaded = new Array();
			this.scriptsToBeLoaded.push(scriptParams)
		},
		extractOptionsFromDataAttributes : function(attrName, optionsProperty) {
			var opt = $(this.element).attr(attrName);
			if (opt)
				this.options[optionsProperty] = opt;
		},
		goOnLoadingScript : function() {
			this.scriptsCurrentlyLoading = new Object();

			if (this.scriptsToBeLoaded.length == 0) {
				console
						.log("warning, problem during scripts dynamic loading : there is no more script to load");
				return;
			}
			var nextScript = this.scriptsToBeLoaded.shift();
			if (this.scriptsToBeLoaded.length == 0 && !nextScript.callback) {
				alert("warning, problem during scripts dynamic loading : the last script to be loaded has no callback");
				return;
			}
			this.sleepUntilScriptIsLoaded(nextScript);
		},
		handleTags : function() {
			if (this.tagStructureExists()) {
				this.handleServerSideGeneratedTags();
			} else
				this.callWebService();
		},
		tagStructureExists : function() {
			return $(this.element).hasClass("apiscol-notice");
		},
		sleepUntilScriptIsLoaded : function(params) {
			var self = this;
			var scriptLoadedInMemory = (params.prefix && jQuery[params.prefix] && jQuery[params.prefix][params.property])
					|| jQuery[params.property];
			if (!self.scriptsCurrentlyLoading)
				self.scriptsCurrentlyLoading = new Object();
			if (!self.scriptsCurrentlyLoading[params.url]
					&& !scriptLoadedInMemory) {
				self.loopCounter = 0;
				self.loadScript(params.url);
				self.scriptsCurrentlyLoading[params.url] = true;
			}
			if (scriptLoadedInMemory)
				(params.callback || this.goOnLoadingScript).call(
						(params.context || self), null);
			else {
				self.loopCounter++;
				if (self.loopCounter > 200) {
					alert("warning, problem during scripts dynamic loading : infinite loop for "
							+ params.url);
					return;
				}
				setTimeout($.proxy(self.sleepUntilScriptIsLoaded, self, {
					url : params.url,
					property : params.property,
					callback : params.callback,
					context : params.context,
					prefix : params.prefix
				}), 50);
			}

		},
		loadScript : function(url) {
			jQuery.ajax({
				async : false,
				type : "GET",
				url : url,
				data : null,
				dataType : 'script'
			});
		},
		getModeScriptUrl : function(mode) {
			return this.options.cdn
					+ this.options.apiscolDisplayModesPattern.replace(
							/VERSION/, this.options.version).replace(/MODE/,
							mode).replace(/FRAMEWORK/,
							frameworkForDevice[this.options.device]);
		},
		generateId : function() {
			this.id = Math.floor(Math.random() * 1000000);
			this.rId = "#" + this.id;
		},
		createStyleSheetLinkTag : function(href, callback) {
			if (!href || Apiscol.prototype.isVoid(href)) {
				callback();
				return;
			}
			var id = href.replace(/\//g, "");
			if ($.data(document.body, "#" + id)) {
				callback();
				return;
			}
			$.data(document.body, "#" + id, true);
			var head = document.getElementsByTagName('head')[0];
			if ($.browser.msie || $.browser.opera) {
				var link = document.createElement('link');
				link.type = "text/css";
				link.rel = "stylesheet"
				link.href = href;
				link.onload = function() {
					// called twice on ie !
					link.onload = $.noop;
					callback();
				}
				head.appendChild(link);
				return $(link);
			}
			if ($.browser.safari || $.browser.webkit) {
				var cssnum = document.styleSheets.length;
				var link = document.createElement('link');
				link.type = "text/css";
				link.rel = "stylesheet"
				link.href = href;
				var ti = setInterval(function() {
					if (document.styleSheets.length > cssnum) {
						clearInterval(ti);
						callback();
					}
				}, 10);
				head.appendChild(link);
				return $(link);
			} else if ($.browser.mozilla) {
				var style = document.createElement('style');
				style.textContent = '@import "' + href + '"';
				var fi = setInterval(function() {
					try {
						style.sheet.cssRules;
						clearInterval(fi);
						callback();
					} catch (e) {
					}
				}, 30);
				head.appendChild(style);
				return $(style);
			}

		},
		callWebService : function() {
			var self = this;
			$.jsonp({
				url : self.options.url + "?format=application/javascript",
				callback : "callback",
				context : self,
				success : self.handleDataArrival
			});
			// TODO gérer erreur
		},
		option : function(key, value) {
			var rebuild = false;
			switch (key) {
			case "style":
				this.plugin["apiscol_mode_" + this.options.mode]("option",
						"style", value);
				break;
			case "url":
				this.displayNotice(false);
				this.options.url = value;
				this.callWebService();
				break;
			case "mode":
				this.displayNotice(false);
				this.options.mode = value;
				this.restaureTagStructure();
				var specificModeUrl = this.getModeScriptUrl(this.options.mode);
				this.planifyScriptLoading({
					url : specificModeUrl,
					property : "apiscol_mode_" + this.options.mode,
					callback : this.decorateInterface,
					prefix : "ui"
				});
				this.goOnLoadingScript();
				break;
			}

			$.Widget.prototype._setOption.apply(this, arguments)
		},
		handleDataArrival : function(data) {
			var snippetLink = data["apiscol:code-snippet"];
			if (snippetLink && snippetLink["@href"]) {
				this.snippetUrl = snippetLink["@href"];
			}
			var atomLinks = data["link"];
			if (atomLinks) {
				var link = $.grep(data["link"], function(link) {
					return link["@rel"] == "describedby"
							&& link["@href"].match(/.*\.js$/);
				});

				// TODO if no result
				var scolomFrUrl = link[0]["@href"];
				this.downloadMetadata(scolomFrUrl);
			}

		},
		downloadMetadata : function(scolomFrUrl) {
			var self = this;
			$.jsonp({
				url : scolomFrUrl,
				callback : "notice",
				context : self,
				success : self.handleMetadataDataArrival
			});
		},
		handleServerSideGeneratedTags : function() {
			this.container = $(this.element).attr("id", this.id);
			this.registerTagStructure();
			this.decorateInterface();
		},
		getContainer : function() {
			return this.container;
		},
		handleMetadataDataArrival : function(data) {
			var self = this, el = self.element;
			var $wrapper = $(document.createElement("div"));
			$(el).after($wrapper);
			if (this.container)
				this.container.remove();
			this.xslTransform(this.stringtoXML(data), this.stringtoXML(xsl),
					$wrapper);
			$(el).hide();
			this.container = $wrapper.find("div.apiscol-notice");
			this.container.attr("id", this.id);
			this.registerTagStructure();
			this.decorateInterface();
		},
		displayNotice : function(bool) {
			$(this.container).children("*:not(.waiter)").css('opacity',
					bool ? '1' : '0');
			if (false)
				this.waiter.appendTo($(this.element));
			else
				this.waiter.remove();
		},
		registerTagStructure : function() {
			this.memorizedContainer = this.container.clone().attr("id", "")
					.remove();
		},
		restaureTagStructure : function() {
			this.newContainer = this.memorizedContainer.clone().attr("id",
					this.id);
			this.container.replaceWith(this.newContainer);
			this.container = this.newContainer;
		},
		decorateInterface : function() {
			var options = {
				apiscol : this
			};
			this.plugin = $(this.container)["apiscol_mode_" + this.options.mode]
					(options);
		},
		destroy : function() {

		},
		isVoid : function(string) {
			return string == null || string == undefined
					|| string.match(/^\s*$/);
		},
		stringtoXML : function(text) {
			if (window.ActiveXObject) {
				var doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML(text);
			} else {
				var parser = new DOMParser();
				var doc = parser.parseFromString(text, 'text/xml');
			}
			return doc;
		},
		xslTransform : function(xmlDoc, xslDoc, $element) {
			if (window.ActiveXObject) {
				if (!this.xslt) {
					this.xslt = new ActiveXObject(
							"MSXML2.FreeThreadedDOMDocument");
					this.xslt.async = false;
					this.xslt.load(xslDoc);

					this.template = new ActiveXObject("MSXML2.XSLTemplate");
					this.template.stylesheet = this.xslt;
				}
				var process = this.template.createProcessor();
				process.input = xmlDoc;
				process.addParameter("language", "fr");
				process.addParameter("standalone", "false");
				process.addParameter("version", this.options.version);

				process.transform();
				$element.html(process.output);
			} else if (document.implementation
					&& document.implementation.createDocument) {
				if (!this.xsltProcessor) {
					this.xsltProcessor = new XSLTProcessor();
					this.xsltProcessor.setParameter(null, "language", "fr");
					this.xsltProcessor
							.setParameter(null, "standalone", "false");
					this.xsltProcessor.setParameter(null, "version",
							this.options.version);
					this.xsltProcessor.importStylesheet(xslDoc);
				}

				var resultDocument = this.xsltProcessor.transformToFragment(
						xmlDoc, document);
				var string = (new XMLSerializer())
						.serializeToString(resultDocument);
				$element.get(0).appendChild(resultDocument);
			}
		}
	};
	$.fn[pluginName] = function(method) {
		if (typeof Apiscol.prototype[method] === 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			return this.each(function() {
				return Apiscol.prototype[method].apply($.data(this, 'apiscol'),
						args);
			});
		} else if (typeof method === 'object' || !method) {
			return this.each(function(index, elem) {
				var notice = new Apiscol(elem, method);
				$.data(this, 'apiscol', notice);
				return notice.getContainer();
			});
		} else {
			$.error('Method ' + method + ' does not exist on jQuery '
					+ pluginName);
		}

	};
})(jQuery, window, document);
jQuery(document).ready(function() {
	$(".apiscol, .apiscol-notice").apiscol();
})

var xsl = ".";