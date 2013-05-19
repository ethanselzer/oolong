(function(){
    "use strict";

    var existingOnloadHandler = window.onload;

    window.mocha.setup( {
        ui: 'bdd',
        reporter: function( runner ){
            var reporterEl = parent.document.getElementById('mocha');
            return window.Mocha.reporters.HTML( runner, reporterEl );
        }
    } );

    window.onload = function(){
        window.expect = window.chai.expect;
        window.mocha.run();

        if( parent && parent.onIframeLoad ){
            parent.onIframeLoad();
        }

        if( typeof existingOnloadHandler === 'function' ){
            existingOnloadHandler.apply( this, arguments );
        }
    };
}());
