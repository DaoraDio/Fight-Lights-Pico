function show_directions_modal() 
{
    const modal = document.getElementById("set_directions_modal");
    show_eightway_modal(false);
    modal.showModal();
}

function close_directions_modal() 
{
    const modal = document.getElementById("set_directions_modal");
    modal.close();
}