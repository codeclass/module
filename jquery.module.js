/**
 * module - jQuery Notification Plugin v 1.0.0
 * Contributors: https://github.com/codeclass/module/graphs/contributors
 *
 * Examples and Documentation - https://github.com/codeclass/module/wiki
 *
 * Licensed under the MIT licenses:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function( $ ){

    /**
     * Path to modules
     * @type {string}
     */
    var modConf = {
        modPath : '',
        verbose: false
    };

    /**
     * modules array
     * @type {{}}
     */
    var modules={};

    /**
     * array of loaded resources
     * @type {{}}
     */
    var resources = {};

    /**
     * loader cache promices by url
     * @type {{}}
     */
    var cache={};

    /**
     * Base module class description
     * @param el
     * @param config
     */
    var baseModule=function(el, config){
        log('base constructor called', el);
        this.onInit = $.Callbacks();
        this.onCreate = $.Callbacks();
        this.onBeforeRender = $.Callbacks();
        this.onAfterRender = $.Callbacks();
        this.el = el;
    };
    baseModule.prototype.template='';
    baseModule.prototype.render=function(){
        this.onBeforeRender.fire(this);
        if(this.template != ''){
            $(this.el).html(this.getTemplate(this.template));
        }
        this.onAfterRender.fire(this);
    };
    baseModule.prototype.getTemplate=function(name){
          if(resources[name]){
              return resources[name];
          } else {
              return name;
          }
    };
    baseModule.prototype.applyConfig = function(config){
        log('Module config', config);
        for (var key in config){
            if(typeof this[key].add ==='function' && typeof config[key] === 'function'){
                this[key].add(config[key]);
            } else {
                this[key] = config[key];
            }
        }
    };
    baseModule.prototype.onInit;
    baseModule.prototype.onCreate;
    baseModule.prototype.onBeforeRender;
    baseModule.prototype.onAfterRender;

    /**
     * Init module function
     * @param module
     * @param config
     * @param el
     */
    var init = function(module, config, el){
        var mod=new modules[module](el, config);
        mod.el=el;
        mod.applyConfig(config);
        mod.render();
        $(el).data(mod);
        mod.onInit.fire(mod);
    };

    /**
     * Cache loading resources
     * @param url
     * @param callback
     * @returns {*}
     */
    var cachedGetResource = function(url, name, process) {
        if ( !cache[ url ] ) {
            var d = new $.Deferred();
            cache[ url ] = d.promise();

            $.get( url )
                .then(function(data){ process(data, name, d.resolve); }, d.reject);
        }
        return cache[ url ];
    };


    /**
     * Load async resources
     * @param module
     * @param config
     * @returns {*}
     */
    var loadResourcesAsync = function( resourcesArray, process, callback ){
        var promises = $.map(resourcesArray, function(url, name){
            return cachedGetResource(modConf.modPath + url, name, process);
        });

        $.when.apply(this, promises)
            .then(callback);
    };

    var log = function(comment, v){
        if(modConf.verbose){
            console.log(comment, v);
        }
    };



    /**
     * Main function initialize module
     *
     */
    $.fn.module = function(module, config, value) {

        //applying global config
        if(typeof module === 'object' || !module){
            $.extend(modConf, module);
            return true;
        }

        if(this.length == 0){
            log('No elements found with selector: ', this.selector);
            return;
        }

        //var data = this.data();


        log('module: ', module);


        if(this.length == 1 && this.data().module == module){ //if module initialized

            var obj = this.data();

            if(typeof config === 'object') { //config passed, update config for module
                obj.applyConfig(config);
                obj.render();
            }

            if(typeof config === 'undefined'){ //only object access
                return obj;
            }

            if(typeof config === 'string') { //property name passed
                //get or set property
                if(typeof value === 'undefined'){
                    //get property
                    return obj[config];
                } else {
                    //set property
                    var conf={};
                    conf[config]=value;
                    obj.applyConfig(conf);
                    obj.render();
                    return this; //for chain
                }
            }
        } else {

            return this.each(function () {
                var el = this;

                if($(this).data().module == module) {
                    log('module initialazied yet', el);
                    return false; //
                }

                log('start loading module', module);
                cachedGetResource(modConf.modPath + module + '.js', module,  // Call loading module if not loaded yet
                    function (data, name, callback) {   //this function save module object to cache
                        var callbackPass = false;
                        if (modules[name] == undefined) {
                            var obj = eval(data);
                            if (obj.constructor != undefined) {
                                var f = obj.constructor;
                                //наследуем от базового объекта
                                //TODO сделать наследование от указанного объекта
                                f.prototype = Object.create(baseModule.prototype);
                                //переносим свойства
                                for (var key in obj) {
                                    f.prototype[key] = obj[key];

                                    //асинхронная подгрузка ресурсов и передача defered-колбэка

                                    if (key == 'resources' && !$.isEmptyObject(f.prototype[key])) {
                                        loadResourcesAsync(
                                            f.prototype[key],
                                            function (data, name, resources_callback) {
                                                resources[name] = data;
                                                resources_callback();
                                            },
                                            callback
                                        );
                                        callbackPass = true; //теперь инициализация не начнется пока не подгрузятся ресурсы
                                    }
                                    if (key == 'css') {
                                        //подгружаем CSS
                                        $("head").append($("<link rel='stylesheet' href='" + modConf.modPath + f.prototype[key] + "' type='text/css' media='screen' />"));
                                    }
                                }
                                f.prototype.module = module;

                                //сохраняем модуль в коллекцию
                                modules[name] = f;
                            } else {
                                log('Module has no constructor', name);
                            }
                        }
                        if (!callbackPass) {
                            callback(); //обратный вызов (для завершения deferred)
                        }
                    })
                    .then(function () {
                        init(module, config, el);
                    }); //initiate and render module

            });
        }
    };
})( jQuery );