function startsWithNumber(str) {
    return /^\d/.test(str);
  }

function check_name(name)
{
    var disallowed = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/; //disallowed characters
    if(name == ""){
        console.log("name empty");
        return "Name cannot be empty";
    }
    else if(startsWithNumber(name))
    {
        console.log("name starts with number");
        return "Name cannot start with a number";
    }
    else if(name.includes("_MyButton"))
    {   
        console.log("name has _MyButton");
        return "Name cannot contain _MyButton";
    }
    else if(disallowed.test(name))
    {
        console.log("name has disallowed character");
        return "Name cannot contain special characters";
    }
    else{
        return true;
    }
}