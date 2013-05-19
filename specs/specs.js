(function(){
    "use strict";

    describe( 'Demo Page', function(){
        it( 'has a text field', function(){
            expect( $( 'input#name' ) ).to.exist;
        } );

        it( 'has a button', function(){
            expect( $( 'input#button' ) ).to.exist;
        } );
        describe( 'Validates Input', function(){
            var errorColor;

            before( function(){
                var errorColor = 'rgb(255, 0, 0 )';
            } );

            it( 'text field must not be empty', function(){
                $( '#button' ).trigger( 'click' );
                expect( $( '#name' ) ).to.have.css( 'border-color', errorColor );
            } );
        } );
    } );
}());