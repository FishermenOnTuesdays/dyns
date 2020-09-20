$(document).on('click', '.remove', function() {
    $('#back_container').height($(".container-md").outerHeight()-2*parseInt($('#back_container').css("padding-bottom")));
    $('#svg_object').height($('#back_container').outerHeight()*1.05);
});
$(document).ready(function(){
    $('#back_container').height($(".container-md").outerHeight()-parseInt($('#back_container').css("padding-bottom")));
    $('#svg_object').height($('#back_container').outerHeight()*1.05);
});
$(document).on('click', '#addx', function() {
    $('#back_container').height($(".container-md").outerHeight()-parseInt($('#back_container').css("padding-bottom")));
    $('#svg_object').height($('#back_container').outerHeight()*1.05);
});