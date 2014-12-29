

var router = new Grapnel();

function flash(str) {
    $('#flash').html(str);
    $('#flash').css('display', 'block');
}

function hide_flash() {
    $('#flash').css('display', 'none');
}

function init() {

/*
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
*/

    router.get('', function(req) {
        hide_flash();
        
        $.getJSON('recent', function(val) {
            var data = val.data;
            var i;
            for(i=0; i < data.attempts.length; i++) {
                data.attempts[i].date = new Date(data.attempts[i].date);
            }
            var tmpl = _.template($('#recent-template').html());

            $('#pagetitle').html("Recent failed access attempts");

            $('#container').html(tmpl(data));

        });

    })

    router.get('access-control-list', function(req) {
        hide_flash();
        
        var tmpl = _.template($('#acl-form-template').html());
        
        $('#pagetitle').html("Access Control List");

        $('#container').html(tmpl());

        $('form').submit(function(e) {
            e.preventDefault();
            hide_flash();
            var query = {
                password: $("input[name='password']").val(),
            };

            if(!query.password) {
                flash("Admin password is required.");
                return;
            }

            $.post('access-control-list', query, function(response) {
                hide_flash();
                
                var tmpl = _.template($('#acl-template').html());
                
                $('#container').html(tmpl(response.data));

            }, 'json').fail(function(xhr) {
                var resp = JSON.parse(xhr.responseText);
                flash("Error: " + resp.msg);
            });
        });
    });


    router.get('grant-access-form/*', function(req) {
        hide_flash();
        var code = req.params[0];
        var tmpl = _.template($('#grant-access-template').html());
        $('#pagetitle').html("Grant physical access to new member");

        $('#container').html(tmpl());
        
        $('form').submit(function(e) {
            e.preventDefault();
            hide_flash();
            var query = {
                password: $("input[name='password']").val(),
                name: $("input[name='name']").val().replace(/\s+/g, ''),
                collective: $("input[name='collective']").val().replace(/\s+/g, ''),
                contact_info: $("input[name='contact_info']").val().replace(/\s+/g, ''),
                notes: $("textarea[name='notes']").val().replace(/\s+/g, '')
            };
            var errors = [];

            // client side validation

            if(!query.password) {
                errors.push("Admin password is required.");
            }
            if(!query.name) {
                errors.push("Name is required.");
            }
            if(!query.collective) {
                errors.push("Collective is required.");
            }
            if(!query.contact_info) {
                errors.push("Contact info is required.");
            }

            if(errors.length > 0) {
                flash(errors.join("<br/>"));
                return;
            }

            // disable the form to prevent multi-submit
            $("input[type='submit']").prop('disabled', true);

            // send it off to the server
            $.post('grant-access/'+code, query, function(response) {
                flash("Access successfully granted! (redirecting...)");
                setTimeout(function() {
                    window.location.href = '';
                }, 3000);

            }, 'json').fail(function(xhr) {
                var resp = JSON.parse(xhr.responseText);
                flash("Error: " + resp.msg);

                // re-enable form
                $("input[type='submit']").prop('disabled', false);
            });
        });
    });

}


$(document).ready(init);
