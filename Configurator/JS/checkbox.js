navigator.sayswho= (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*([\d\.]+)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]:[N, navigator.appVersion, '-?'];
    return M.join(' ');
})();

function call_on_start()
{
    update_leniency_input();
    update_idle_mode();

    set_code();
    set_bg_table();
    show_idle1_config();
    update_smooth_value()
    show_smooth_slider()

    /*var browser = navigator.sayswho;
    browser = browser.split(" ");
    console.log(browser);

    if(browser[0] == 'Chrome')
        document.getElementById("load_from_clipboard").hidden = false;*/

    var playerled_cb = document.getElementById("playerled_cb");
    if(playerled_cb.checked)
    {
        document.getElementById("playerled_button").disabled = true;
    }
    else
        document.getElementById("playerled_button").disabled = false;
}

function update_leniency_input()
{
    var checkbox = document.getElementById("leniency_cb").checked;

    if (checkbox == true)
    {
        document.getElementById("leniency_tb").disabled = true;
        document.getElementById("leniency_tx").style.color = "grey";
    }
    else
    {
        document.getElementById("leniency_tb").disabled = false;
        document.getElementById("leniency_tx").style.color = "black";
    }
}

function update_idle_mode()
{
    var checkbox = document.getElementById("idle_cb").checked;

    if (checkbox == true)
    {
        document.getElementById("idle_select").disabled = true;
        document.getElementById("idle_tb").disabled = true;

        document.getElementById("idlemode_tx").style.color = "grey";
        document.getElementById("idleseconds_tx").style.color = "grey";
        document.getElementById("idlemode_container").style.borderColor  = "rgb(192, 192, 192)";

        document.getElementById("idle1_config").disabled = true;
        document.getElementById("idle_led_exlude_button").disabled = true;
        

    }
    else
    {
        document.getElementById("idle_select").disabled = false;
        document.getElementById("idle_tb").disabled = false;
        document.getElementById("idle_led_exlude_button").disabled = false;

        document.getElementById("idlemode_tx").style.color = "black";
        document.getElementById("idleseconds_tx").style.color = "black";

        document.getElementById("idle1_config").disabled = false;
        document.getElementById("idlemode_container").style.borderColor  = "rgb(128, 128, 128)";
    }
}

function update_stats()
{
    var checkbox = document.getElementById("stats_cb").checked;

    if(checkbox == true)
    {
        document.getElementById("stats_tx").style.color = "black";
    }
    else
    {
        document.getElementById("stats_tx").style.color = "grey";
    }
}