  $(document).ready(function(){
    $('.form').on('submit',function(evt){
    			evt.preventDefault();
    			var action = $(this).attr('action');
    			var container = $(this).closest('.form')
    			$.ajax({
      			url:action,
      			type:'POST',
      			success:function(data){
      				container.html('<p>'+message+'</p>')
      			},
      			error:function(e){
      				container.html('<p>很抱歉出错啦~</p>')
      			}
    			})
    })
  })