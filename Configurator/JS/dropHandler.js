const textbox = document.getElementById("new_codebox");
const droppable = document.getElementById("droppable");

droppable.addEventListener("dragover", (event) => 
{
  event.preventDefault();
  return false;
});

droppable.addEventListener("drop", (event) => 
{
  event.preventDefault();

  const fileList = event.dataTransfer.files;

  if (fileList.length > 0) {
    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = (fileEvent) => {
      const fileContent = fileEvent.target.result;
      textbox.value = fileContent;
      get_code();
    };

    reader.readAsText(file);
  }
});

