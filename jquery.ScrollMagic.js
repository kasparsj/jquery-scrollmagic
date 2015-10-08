;(function($) {
    'use strict';

    var controller = null;

    $.fn.ScrollMagic = function(options) {
        var scenes = [];
        this.each(function(i, element) {
            scenes = scenes.concat(createMultipleScenes(element, options));
        });
        return scenes.length == 1 ? scenes[0] : scenes;
    };

    $.ScrollMagic = {
        getController: getController,
        destroyController: destroyController
    };

    function getController() {
        if (controller == null) {
            controller = new ScrollMagic.Controller();
        }
        return controller;
    }

    function destroyController(reset) {
        if (controller != null) {
            controller.destroy(reset);
            controller = null;
        }
    }

    function createMultipleScenes(element, jsOptions) {
        var $element = $(element),
            scenes = [],
            dataOptions = $element.data("scrollmagic");
        if (!Array.isArray(dataOptions)) {
            dataOptions = [dataOptions];
        }
        if (!Array.isArray(jsOptions)) {
            jsOptions = [jsOptions];
        }
        var length = Math.max(dataOptions.length, jsOptions.length);
        for (var i=0; i<length; i++) {
            var options = $.extend(dataOptions[i] || {}, jsOptions[i] || {});
            scenes.push(createSingleScene(element, options));
        }
        return scenes;
    }

    function createSingleScene(element, options) {
        if (options.dataElement) {
            var moreOptions = $(options.dataElement).data("scrollmagic");
            if (typeof moreOptions == "object") {
                options = $.extend(options, moreOptions);
            }
        }
        var scene = createScene(element, options);
        if (options.pin) {
            addSceneEvents(scene, {
                "enter leave": function(e) {
                    var method = e.type == "enter" ? "addClass" : "removeClass";
                    $(element)[method](options.pin.classes || "sm-pinned");
                }
            });
            scene.setPin(element, options.pin);
        }
        var tween = copyProperties(["x", "y", "z", "scale", "rotate", "opacity"], options, options.tween || {});
        if (!isEmpty(tween)) {
            scene.setTween(element, tween);
        }
        if (options.class) {
            if (typeof options.class != "object") {
                options.class = {classes: options.class};
            }
            scene.setClassToggle(options.class.element || element, options.class.classes, options.class.toggle);
        }
        // better use bootstrap's scrollspy
        //if (options.navbar) {
        //    var itemSelector = options.itemSelector || "ul.navbar-nav > li",
        //        activeSelector = options.activeSelector || "[href=#"+$(element).attr("id")+"]",
        //        classes = options.classes || "active";
        //    if (typeof(options.duration) == "undefined") {
        //        options.duration = "100%";
        //    }
        //    options.events = $.extend({
        //        "leave enter": function(e) {
        //            var $navbar = $(options.element);
        //            if (e.type != "leave" || $navbar.find("."+classes.split(" ")[0]+" "+activeSelector).length) {
        //                var $items = $navbar.find(itemSelector);
        //                $items.removeClass(classes);
        //                if (e.type == "enter") {
        //                    $items.filter(function() {
        //                        return $(this).find(activeSelector).length > 0;
        //                    }).addClass(classes);
        //                }
        //            }
        //        }
        //    }, options.events || {});
        //}
    }

    function createScene(element, options) {
        var triggerElement = options.triggerElement || element;
        if (typeof triggerElement == "function") {
            triggerElement = triggerElement.call(element);
        }
        var scene = new ScrollMagic.Scene({
            triggerElement: triggerElement,
            triggerHook: options.triggerHook || 0,
            duration: parseDuration(options.duration || 0, triggerElement)
        });
        if (options.events) {
            addSceneEvents(scene, options.events);
        }
        if (options.addIndicators) {
            scene.addIndicators();
        }
        scene.addTo(options.controller || getController());
        return scene;
    }

    function parseDuration(val, triggerElement) {
        if (typeof(val) == "string") {
            if (val.match(/^(\.|\d)*\d+%$/)) {
                // override percentage to refer to triggerElement height
                var perc = parseFloat(val) / 100;
                val = function() {
                    return $(triggerElement).outerHeight(true) * perc;
                }
            }
            else if (val.match(/^(\.|\d)*\d+v$/)) {
                // make use of default percentage implementation, which refers to controller height
                val = val.slice(0, -1) + "%";
            }
        }
        return val;
    }

    function addSceneEvents(scene, events) {
        for (var event in events) {
            scene.on(event, events[event]);
        }
    }

    function copyProperties(props, srcObj, dstObj) {
        for (var i=0; i<props.length; i++) {
            if (typeof srcObj[props[i]] != "undefined") {
                dstObj[props[i]] = srcObj[props[i]];
            }
        }
        return dstObj;
    }

    function isEmpty(obj) {
        if (obj == null) return true;
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    }

    $(function() {

        $("[data-scrollmagic]").ScrollMagic();

    });

})(jQuery);