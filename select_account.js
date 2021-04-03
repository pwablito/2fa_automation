$(".checkbox").click(() => {
    let checked = false;
    let boxes = $(".checkbox");
    boxes.each((index) => {
        if (boxes[index].checked) {
            checked = true;
        }
    });
    if (checked) {
        $("#select_accounts").removeClass("disabled");
    } else {
        $("#select_accounts").addClass("disabled");
    }
});