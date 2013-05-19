(function(){
    "use strict";

    describe( 'Demo Page', function(){
        it( 'has a text field', function(){
            expect( $( 'input#name' ) ).to.exist;
        } );

        it( 'has a button', function(){
            expect( $( 'input#button' ) ).to.exist;
        } );
        describe( 'Validates Text Field', function(){
            var errorColor, successColor, btn, name;

            before( function(){
                errorColor = 'rgb(255, 0, 0)';
                successColor = 'rgb(0, 255, 0)';
                btn = $( '#button' );
                name = $( '#name' );
            } );

            it( 'must not be empty', function(){
                btn.trigger( 'click' );
                expect( name ).to.have.css( 'border-color', errorColor );
            } );

            it( 'accepts all other input', function(){
                name.val( 'foo bar' );
                btn.trigger( 'click' );
                expect( name ).to.have.css( 'border-color', successColor );
            } );
        } );
    } );
}());