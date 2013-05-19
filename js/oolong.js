(function(){
    "use strict";

    var storeName = 'oolong',
        sliderEl = $( '#slider' ),
        fixtureEl = $( '#fixture' ),
        sliderValEl = $( '#slider-value' ),
        fixtureSrc = 'fixture.html';

    function initialize(){
        var defaultStore = '{ "lastSliderVal" : 50 }',
            store = getStore( storeName, defaultStore ),
            val = store.lastSliderVal;

        setFixtureQueryString( fixtureSrc );
        setFixtureScale( getPercentage( val ) );
        initSlider( val );
        setSliderReport( val );
    }

    function setFixtureQueryString( fixtureSrc ){
        var qs = window.location.search;
        fixtureEl.attr( 'src', fixtureSrc + qs );
    }

    function setFixtureScale( scale ){
        setElScale( fixtureEl, scale );
    }

    function initSlider( val ){
        sliderEl.slider({
            value : val,
            max : 150,
            slide : observeSlide
        });
    }

    function setSliderReport( val ){
        sliderValEl.text( val );
    }

    function observeSlide( event, ui ){
        var val = ui.value;
        setElScale( fixtureEl, getPercentage( val ) );
        setStore( storeName, { "lastSliderVal" : val } );
        setSliderReport( val );
    }

    function getStore( storeName, defaultValue ){
        var store = localStorage[ storeName ];
        return JSON.parse( store || defaultValue || '{}' );
    }

    function setStore( storeName, value ){
        var store = getStore( storeName );
        $.extend( store, value );
        localStorage[ storeName ] = JSON.stringify( store );
    }

    function setElScale( el, scale ){
        var s = 'scale(' + scale + ')';
        el.css({
            '-webkit-transform' : s,
            '-ms-transform' : s,
            'transform' : s
        });
    }

    function getPercentage( wholeNumber ){
        return ( wholeNumber / 100 );
    }

    window.onIframeLoad = function(){
        fixtureEl.addClass( 'fixture-shadow' );
    };

    initialize();
}());
