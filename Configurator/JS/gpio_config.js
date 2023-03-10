var button_name;

function open_gpio_modal(that)
{
    var modal = document.querySelector('#gpio_config_modal');
    button_name = that.name;
    modal.showModal();
}

function close_gpio_modal()
{
    var modal = document.querySelector('#gpio_config_modal');
    var modal2 = document.querySelector('#gpio_config_confirm');
    modal.close();
    modal2.close();
}

function set_gpio(gpio_pin)
{
    var label = "gp" + gpio_pin + "_label";
    var modal = document.querySelector('#gpio_config_confirm');
    modal.show();

    //document.getElementById(label).innerHTML = button_name;
    
}

function close_confirm_modal()
{
    var modal = document.querySelector('#gpio_config_confirm');
    modal.close();
}