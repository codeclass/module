/**
 * This is example of module
 * For JQuery Module Plugin
 * Created by Den on 22.02.2016.
 */
(function(){

    //return module object description
    return {
        /**
         * Declare module constructor
         */
        constructor: function(el, config){

            //parent constructor call
            baseModule.apply(this, el, config);

            //closure
            var $this = this;

            //add handler to module init function
            $this.onInit.add(function(){
                $this.setCaption($this.caption);
                $this.setText($this.text);
            });

            //declare module functions
            $this.setCaption = function(caption){
                $('.text1', $(el)).html(caption);
            };

            $this.setText = function(text){
                $('.text2', $(el)).html(text);
            };

            $this.addText = function(text){
                $('.text2', $(el)).append(text);
                $this.onTextAdd.fire();
            };

            //declare event
            $this.onTextAdd = $.Callbacks();

        },

        /**
         * Declare module properties
         */
        text: 'Default text',
        caption: 'Default caption',


        /**
         *  Declare visual features
         */
        // in template we can use as the name of the resource and clean HTML code
        template: 'helloTpl',
        css: 'hello/main.css',

        // resources object - name and path
        resources : {
            helloTpl : 'hello/main.html'
        }

        // extends not coming yet
        //extends: '',
    }

})();