function startsWithNumber(str) {
    return /^\d/.test(str);
  }

function check_name(name)
{
    var disallowed = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/; //disallowed characters

    //these names are not allowed because they are python keywords
    const pythonKeywords = ['False', 'None', 'True', 'and', 'as','assert', 'async', 'await', 'break', 'class',
                              'continue', 'def', 'del', 'elif', 'else', 'except','finally', 'for', 'from', 'global', 
                              'if', 'import','in', 'is', 'lambda','nonlocal', 'not', 'or','pass', 'raise',
                                'return', 'try', 'while', 'with', 'yield'];

    //these names are not allowed because they are variable names inside the config.py
    const disallowed_names = [
        "blank","colors","idle_mode1_colors","idle_mode1_speed","profile_name","led_count","PIN_NUM",
        "leniency","brightness_mod","brightness_steps","idle_mode","idle_after","save_stats","input_reset_time",
        "profile_color","clear_background_on_press","background","fadeout_speed","fadein_speed","button_list",
        "ledOptions_led_buttons","ledOptions_start_time","ledOptions_increase_brightness","ledOptions_decrease_brightness",
        "ledOptions_left_button","ledOptions_right_button","ledOptions_confirm","rainbow_speed","activate_player_led",
        "playerLED_brightness","playerLED_PIN_NUM","P1_color","P2_color","P3_color","P4_color"
      ];
      

    if(name == ""){
        return "Name cannot be empty";
    }
    else if(name.charAt(0) === "_")
    {
        return "Name cannot start with underscore";
    }
    else if(startsWithNumber(name))
    {
        return "Name cannot start with a number";
    }
    else if(name.includes("_MyButton"))
    {   
        return "Name cannot contain _MyButton";
    }
    else if(disallowed.test(name))
    {
        return "Name cannot contain special characters";
    }
    for(var i = 0; i < pythonKeywords.length; i++)
    {
        if(name == pythonKeywords[i])
            return "Name cannot be a Python Keyword";
    }
    for(var i = 0; i < disallowed_names.length; i++)
    {
        if(name == disallowed_names[i])
            return "Name cannot be: " + disallowed_names[i];
    }

    return true;
    
}