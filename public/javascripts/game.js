$(document).ready(function() {

    var remainChars = [];
    var typedChars  = [];

    loadNextWord();
    
    $(document).on("keydown", function(event){
    
        //Backspace
        if(event.keyCode == 13){
            $("#submit").click();
        }
        else if(event.keyCode == 8){
            event.preventDefault();
            if(typedChars.length > 0){
                var char = typedChars.pop();
                remainChars.unshift(char);
                
                updateImage("remain", remainChars);
                updateImage("typed", typedChars);
            }
        } 
        else {
            var input = String.fromCharCode(event.keyCode).toLowerCase();
            var index = $.inArray(input, remainChars);
            if(index >= 0){
                remainChars.splice(index,1);
                typedChars.push(input);
                
                updateImage("remain", remainChars);
                updateImage("typed", typedChars);
            }   
        }
        
        //$("#result").empty();
    });
    
    function updateImage(divID, arr){
        var div = $("#" + divID);
        div.empty();
        for(var i=0; i< arr.length; i++){
            div.append('<img src="assets/images/Letters/'+arr[i].toUpperCase()+'.jpg">');
        }
    };
    
    function loadNextWord(){
        setTimeout(function() {
            
            $.get("/app/game", 
                function(data){
                    $(".jumbotron").empty();
                    $(".jumbotron").append(data);
                    
                    $(document).ready(function() {
                        $("#result").empty();
                        var text = $("#scramble").val();
                        var arr = text.split('-');
                        updateImage("remain", arr);
                        remainChars = arr;
                        typedChars  = [];
                        
                        $("#submit").on("click", function(event){
                            var result = typedChars.join("");
                            if (result.length > 0) {
                                $.get("/app/submit",{answer: result},
                                    function(data){
                                        var status = data.status;
                                        var img = "";
                                        if(status == 1){
                                            img = "right";
                                            $("#result").empty();
                                            var text = $("#scramble").val();
                                            var arr = text.split('-');
                                            updateImage("remain", arr);
                                            remainChars = arr;
                                            typedChars  = [];
                                            updateImage("typed", typedChars);
                                            var typedWords = $("#typedWords");
                                            typedWords.append(' - ' + result);
                                            var correctWords = $("#correctWords").val();
                                            correctWords = correctWords.replace(" - " + result, '');
                                            $("#correctWords").val(correctWords);
                                            $("#correctWordsShow").html(correctWords + ('<br>You still have ' + (correctWords.split(" -").length - 1) + ' words left on the game'));

                                        }
                                        else if (status == 2) {
                                            img = "right";
                                            $("#result").empty();
                                            var text = $("#scramble").val();
                                            var arr = text.split('-');
                                            updateImage("remain", arr);
                                            remainChars = arr;
                                            typedChars  = [];
                                            updateImage("typed", typedChars);
                                            var typedWords = $("#typedWords");
                                            typedWords.append(' - ' + result);
                                            var correctWords = $("#correctWords").val();
                                            correctWords = correctWords.replace(" - " + result, '');
                                            $("#correctWords").val(correctWords);
                                            $("#correctWordsShow").html(correctWords + ('<br>You still have ' + (correctWords.split(" -").length - 1) + ' words left on the game'));

                                            var div = $("#endGame");
                                            div.empty();
                                            div.append('<p>Unbelievable! You Win! <br>You can restart with a ' +
                                                'new game by clicking the New Game button.</p>');
                                            $("#digits").countdown('pause');
                                        }
                                        else {
                                            img = "wrong";
                                        }

                                        var div = $("#result");
                                        div.empty();
                                        div.append('<img src="assets/images/' + img + '.jpg">');
                                    }
                                    ,"json");
                            }
                        });

                        $("#surrender").on("click", function(){
                            var div = $("#correctWordsShow");
                            var correctWords = $("#correctWords").val();
                            correctWords = correctWords + ('<br>You still have ' + (correctWords.split(" - ").length - 1) + ' words left on the game');
                            div.html(correctWords);
                            div.show();

                        });
                        
                        $("#digits").countdown({
                            image: "assets/img/digits.png",
                            format: 'sss',
                            startTime: "300",
                            timerEnd: function() {
                                var div = $("#endGame");
                                div.empty();
                                div.append('<p>You Lose! <br>You can check the result by ' +
                                    'clicking Surrender Button. <br>Or restart with a ' +
                                    'new game by clicking the New Game button. <br>' +
                                    'Or keep playing the rest of this game with no time limit!</p>');

                            }
                        });

                        $("#newGame").on("click", function () {
                            loadNextWord();
                        });
        
                    });
                }
            );
            
        }, 2000);
    };

});