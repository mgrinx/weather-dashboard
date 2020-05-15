$(() => {
    const URL="https://api.openweathermap.org/data/2.5/";
    const API_KEY="5f17772a53e391e3c19b415d51fdd030";


    let history = JSON.parse(localStorage.getItem("weather-search-history"));
    if(!history) history = [];
    const maxHistoryItems = 15;

    const renderHistory = q => {
        if(history.length>maxHistoryItems){
            history.shift();
            $("#search-history").children()[$("#search-history").children().length-1].remove();
        }
        $("#search-history").prepend($("<button>")
        .attr("class", "history-item list-group-item list-group-item-action")
        .text(q));
    }

    //run once on start
    history.forEach(element => renderHistory(element));

    $("#search-bar").submit(function() {
        let query = $("#search-input").val().trim();
        let lat, lon;

        $.get(URL+"weather?q="+query+"&appid="+API_KEY,data=>{

            // console.log(data);

            lat = data.coord.lat;
            lon = data.coord.lon;

            $("#city-name").html(data.name + "<br>" + moment().format("dddd, M/D") + " ");

            //dynamically create the search history
            history.push(data.name);
            renderHistory(data.name);
            localStorage.setItem("weather-search-history", JSON.stringify(history));

            let weatherEmoji = $("<img>").attr("src","http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png");
            $("#city-name").append(weatherEmoji);

            let temp = ((data.main.temp - 273.15) * 9 / 5 + 32).toFixed(1) + "°F";
            $("#current-temp").text(temp + ", " + data.weather[0].description);
            $("#humidity").text("Humidity: " + data.main.humidity + "%");
            $("#wind-speed").text("Wind: " + Math.round(data.wind.speed * 2.237) + " mph");

        }).then(()=>{
            $.get(URL+"uvi?lat=" + lat + "&lon=" + lon + "&appid="+API_KEY,data=>{
                // console.log(data);
                let bgColor;
                let textColor;
                switch(Math.floor(data.value)){
                    case 0:
                    case 1:
                    case 2:
                        bgColor = "lime";
                        textColor = "black";
                        break;
                    case 3:
                    case 4:
                    case 5:
                        bgColor = "yellow";
                        textColor = "black";
                        break;
                    case 6:
                    case 7:
                        bgColor = "orange";
                        textColor = "white";
                        break;
                    case 8:
                    case 9:
                    case 10:
                        bgColor = "red";
                        textColor = "white";
                        break;
                    default:
                        bgColor = "purple";
                        textColor = "white";
                }
                $("#uvi").html(`UVI: <span class="rounded" style="background:${bgColor};color:${textColor};">${data.value}</span>`);
            });
        }).then(()=>{

            $.get(URL+"forecast?q="+query+"&appid="+API_KEY,data=>{

                // console.log(data);

                //five day forecast
                $("#forecast-cards").html("");
                for(let i = 0; i < 40; i += 8) {
                    let card = $("<div>")
                    .attr("class","card w-100 mb-3")
                    .append(
                        $("<div>")
                        .attr("class","card-body")
                        .append(
                            $("<h6>")
                            .attr("class","card-subtitle mb-2").text(moment(data.list[i].dt_txt).format("dddd, M/D"))
                            .append(
                                $("<img>")
                                .attr("src","http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png")
                                .attr("style", "height:2rem")
                            )
                        )
                        .append(
                            $("<h6>")
                            .attr("class","card-subtitle mb-2 text-muted")
                            .text(((data.list[i].main.temp - 273.15) * 9 / 5 + 32).toFixed(1) + "°F @ " + data.list[i].main.humidity + "%")
                        )
                    );

                    $("#forecast-cards").append(card);
                }
            });

        }).catch(err=>{
            console.log(err);
            let alert = $("<div>")
            .attr("class", "alert alert-danger alert-dismissible fade show mt-3")
            .attr("role", "alert")
            .append("City not found: " + query)
            .append(
                $("<button>")
                .attr("class", "close")
                .attr("data-dismiss", "alert")
                .html("&times;")
            );
            $("#alert").html(alert);
        });

        return false;
    });

    $("#search-history").click(function(event) {
        $("#search-input").val($(event.target).text());
        $("#search-bar").submit();
        return false;
    });

    if(history){
        $("#search-input").val(history[history.length-1]);
        $("#search-bar").submit();
    }

});