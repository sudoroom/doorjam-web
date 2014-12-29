

var router = new Grapnel();

function flash(str) {
    $('#flash').html(str);
    $('#flash').css('display', 'block');
}

function hide_flash() {
    $('#flash').css('display', 'none');
}

function init() {

    router.get('', function(req){
        hide_flash();
        $('#extra').html('');
        $.getJSON('foo', function(val) {
            var data = val.data;
            var tmpl = _.template($('#main-template').html());

            $('#pagetitle').html("doorjam");
            
            $('#container').html('<p>'+data+'</p>');
            
        });
    });
}


$(document).ready(init);
