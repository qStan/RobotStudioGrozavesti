$(function () {

    $('.panel').matchHeight();


    var base_url = 'http://127.0.0.1/';
    // 12 live updating
    var signal_status = $('#io_signals_set_toggle'),
        motors_status = $('#panel_ctrlstate_set'),
        speed_status = $('#panel_speedratio_get'),
        ctrl_restart = $('#ctrl_restartmode_set'),
        simulation_start = $('#simulation_start'),
        simulation_stop = $('#simulation_stop'),
        simulation_reset = $('#simulation_reset');

    var sensors_array = ['do_cupleaza_V', 'do_cupleaza_ATI', 'DI_S2_piesa_pe_masa', 'DO_deschide_cutie', 'DO_S7_piesa_efector_V', 'DI_piesa_gata', 'MOTLMP', 'ES1'];
    function update_globals() {
        panel_get_motors('ctrlstate');
        panel_get_speedratio('speedratio');

        var signal_status = $('#io_signals_get').val();
        io_signals_get(false, signal_status);

        sensors_array.forEach(function(e){
            io_signals_get(false, e);
        });
    }
    
    function panel_set_speedratio(command, value2) {
        var url = 'rw/panel/';
        $.ajax({
            method: 'POST',
            url: base_url + url + command+'?action=set'+command,
            xhrFields: {
                withCredentials: true
            },
            data: jQuery.param({
                'speed-ratio': value2
            }),
            contentType: 'application/x-www-form-urlencoded',
            success: function(d) {

            },
            error: function (e) {
                // console.log(e)
            }
        })
    }

    function panel_get_speedratio(command) {
        var url = 'rw/panel/';
        $.ajax({
            method: 'GET',
            url: base_url + url + command+'?json=1',
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/x-www-form-urlencoded',
            success: function(d) {
                console.log(d._embedded._state[0].speedratio);
                speed_status.slider('setValue', d._embedded._state[0].speedratio);
            },
            error: function (e) {
                // console.log(e)
            }
        })
    }

    function rapid_set(command, arg, value) {
        var url = 'rw/rapid/';
        $.ajax({
            method: 'POST',
            url: base_url + url + command+'?action='+arg,
            xhrFields: {
                withCredentials: true
            },
            data: value,
            contentType: 'application/x-www-form-urlencoded',
            success: function(d) {
                console.log(d);
            },
            error: function (e) {
                // console.log(e)
            }
        })
    }
    function startRapidProgram()
    {
        console.log("startRapidProgram()");

        var rwStartProgram = new XMLHttpRequest();
        rwStartProgram.onreadystatechange = function()
        {
            console.log("onreadystatechange() readyState: " + rwStartProgram.readyState + ", status: " + rwStartProgram.status);

            if (rwStartProgram.readyState == 4)
            {
                console.log("onreadystatechange() responseText: " + rwStartProgram.responseText);
            }
        }

        var url = "http://127.0.0.1:80/rw/rapid/execution?action=start&json=1";
        var params = "regain=continue&execmode=continue&cycle=forever&condition=none&stopatbp=disabled&alltaskbytsp=false";

        rwStartProgram.open("POST", url, true, "Default User", "robotics");
        rwStartProgram.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        rwStartProgram.send(params);
    }

    function panel_set_motors(command, value) {
        var url = 'rw/panel/';
        var val_parsed = value == true ? 'motoron' : 'motoroff' ;
        $.ajax({
            method: 'POST',
            url: base_url + url + command+'?action=set'+command,
            xhrFields: {
                withCredentials: true
            },
            data: jQuery.param({
                'ctrl-state': val_parsed
            }),
            contentType: 'application/x-www-form-urlencoded',
            success: function(d) {
                console.log(d);
            },
            error: function (e) {
                // console.log(e)
            }
        })
    }

    function controller_set() {
        var url = 'ctrl';
        $.ajax({
            method: 'POST',
            url: base_url + url +'?action=setrestartmode',
            xhrFields: {
                withCredentials: true
            },
            data: jQuery.param({
                'restart-mode': 'restart'
            }),
            contentType: 'application/x-www-form-urlencoded',
            success: function(d) {
                console.log(d);
            },
            error: function (e) {
                // console.log(e)
            }
        })
    }


    function panel_get_motors(command) {
        var url = 'rw/panel/';

        $.ajax({
            method: 'GET',
            url: base_url + url + command+'?json=1',
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/x-www-form-urlencoded',
            success: function(d) {
                console.log(d._embedded._state[0].ctrlstate);
                d._embedded._state[0].ctrlstate == 'motoroff' ? motors_status.bootstrapToggle('off') : motors_status.bootstrapToggle('on');

            },
            error: function (e) {
                // console.log(e)
            }
        })
    }

    function io_signals_set(id,value) {
        var iosystem_signals = 'rw/iosystem/signals/';

        $.ajax({
            method: 'POST',
            url: base_url + iosystem_signals + 'Local/'+id+'?action=set',
            xhrFields: {
                withCredentials: true
            },
            data: jQuery.param({
                lvalue: +value
            }),
            contentType: 'application/x-www-form-urlencoded',

            error: function (e) {
                // console.log(e)
            }
        });
    }

    function io_signals_get(change, id) {
        var iosystem_signals = 'rw/iosystem/signals/';

        $.ajax({
            method: 'GET',
            url: base_url + iosystem_signals + 'Local/'+id+'?json=1',
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            // contentType: 'application/json',
            contentType: 'application/x-www-form-urlencoded',

            success: function(d) {
                var value = d._embedded._state[0].lvalue;
                console.log(value);
                if(change) {
                    value == 0 ? signal_status.bootstrapToggle('off') : signal_status.bootstrapToggle('on');
                }
                $('#'+id).html(value);

            },
            error: function (e) {
                // console.log(e)
            }
        });
    }


    simulation_start.click(function () {
        rapid_set('execution', 'start', 'regain=continue&execmode=continue&cycle=forever&condition=none&stopatbp=disabled&alltaskbytsp=false')
    });

    simulation_stop.click(function () {
        rapid_set('execution', 'stop', ' ')
    });

    simulation_reset.click(function () {
        rapid_set('execution', 'resetpp')
    });

    $('#io_signals_get').change(function () {
        var signal_status = $('#io_signals_get').val();
        io_signals_get(true, signal_status);
    });

    signal_status.change(function (event) {
        var signal_id = $('#io_signals_get').val();
        io_signals_set(signal_id, $(this).prop('checked'));
    });

    //Set Speedratio
    speed_status.change(function () {
        var value = speed_status.val();
        // alert(value);
        panel_set_speedratio('speedratio',value)
    });

    //Motors ON/OFF
    motors_status.change(function (event) {
        panel_set_motors('ctrlstate',$(this).prop('checked'));

    });

    ctrl_restart.click(function (event) {
        controller_set();
    });

    update_globals();
    setInterval(function() {
        // update_globals()
    }, 1000);

});