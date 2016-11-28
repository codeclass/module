/**
 * This module represents tag a
 * For JQuery Module Plugin
 * Created by Den on 10.10.2016.
 */
(function(){

    return {
        constructor: function(el, config){
            baseModule.apply(this, el, config);

            var $this = this;

            $this.onInit.add(function(){

                $(el).on('click', function(e){
                    e.preventDefault();
                    $this.onClick.fire($this);
                });

                $(el).attr('href', $this.href);
            });

            $this.onClick = $.Callbacks();

        },

        href: ''

    }

})();