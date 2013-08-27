/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

Game = {};

(function () {
    var infocus = true;
    var fliptime = 400;
    var ignore = false;
    var matchcard = undefined;
    var win_level = 0;
    var game_level = -1;
    var lvl_bg_sound;
    var flip_sound;
    var match_sound;
    var mismatch_sound;
    var click_sound;
    var win_sound;

    function gamesound(audio_id, file, loop) {
        $('<audio>', {
            id: audio_id,
            src: file,
            preload: 'auto',
            loop: (loop == undefined)?false:loop
        }).appendTo('body');

        this.play = function play() {
            $('#'+audio_id)[0].play();
        };

        this.pause = function pause() {
            $('#'+audio_id)[0].pause();
        };
    }

    function stop_bg_sounds() {
        for(var i = 0; i < 3; i++)
        {
            lvl_bg_sound[i].pause();
            if(lvl_bg_sound[i].currentTime > 0)
                lvl_bg_sound[i].currentTime = 0;
        }
    }

    var gamedata = [
        {
            cardcount : 8
        },
        {
            cardcount : 12
        },
        {
            cardcount : 16
        }
    ];

    function input_on() {
        ignore = false;
    }

    function input_off() {
        ignore = true;
    }

    function cardEntry(classname) {
        this.classname = classname;
        this.flipped = false;
    }

    function win_dlg(lvl) {
        win_level = lvl;

        if(lvl < 3)
            $("#win_btn2").text("NEXT LEVEL");
        else
            $("#win_btn2").text("BACK TO START");

        win_sound.play();
        $("#win_dlg_page").show();
    }

    function update_matches(lvl) {
        var flipcount = 0;
        var cardcount = gamedata[lvl-1].cardcount;
        $(".flip").each(function() { flipcount++; });
        var matches = (flipcount/2)|0;
        var possible_matches = (cardcount/2)|0;

        /* set the match text */
        $("#lvl"+lvl+"_matches").text("Matches "+matches+"/"+possible_matches);

        return (flipcount >= cardcount);
    }

    function card_flipped(elem) {
        var newcard = $(elem).attr("id");
        var lvl = parseInt(newcard.substring(3, 4));

        if(matchcard != undefined)
        {
            var newclass = $("#"+newcard+" .front").attr("class");
            var matchclass = $("#"+matchcard+" .front").attr("class");

            if(newclass == matchclass)
            {
                /* good match */
                if(update_matches(lvl))
                {
                    win_dlg(lvl);
                }
                else
                {
                    match_sound.play();
                    input_on();
                }
            }
            else
            {
                /* bad match */
                mismatch_sound.play();
                $("#"+newcard).removeClass('flip');
                $("#"+matchcard).removeClass('flip');

                /* keep ignoring input til the cards are flipped back */
                window.setTimeout("Game.input_on()", fliptime);
            }

            /* reset the match card */
            matchcard = undefined;
        }
        else
        {
            /* first card in match attempt, set it and wait */
            matchcard = newcard;
            input_on();
        }
    }

    function generate_hint(lvl) {
        if(matchcard != undefined)
        {
            var matchclass = $("#"+matchcard+" .front").attr("class");
            $(".lvl"+lvl+"_card").each(function() {
                var newcard = $(this).attr("id");
                var newclass = $("#"+newcard+" .front").attr("class");
                if((matchclass == newclass)&&(matchcard != newcard))
                {
                    /* ignore clicks while hint is generated */
                    input_off();

                    /* flip the card's match for the poor child */
                    flip_sound.play();
                    $("#"+newcard).addClass('flip');

                    if(update_matches(lvl))
                    {
                        match_sound.play();
                        window.setTimeout("Game.win_dlg("+lvl+")", fliptime);
                    }
                    else
                    {
                        match_sound.play();
                        window.setTimeout("Game.input_on()", fliptime);
                    }
                }
            });
            matchcard = undefined;
        }
        else
        {
            var cardlist = new Array();
            $(".lvl"+lvl+"_card").each(function() {
                if(!$(this).hasClass('flip'))
                    cardlist.push($(this).attr("id"));
            });

            /* if all cards are flipped, return */
            if(cardlist.length <= 0)
                return;

            var target = (Math.random() * cardlist.length)|0;
            var tgtcard = cardlist[target];
            var tgtclass = $("#"+tgtcard+" .front").attr("class");

            $(".lvl"+lvl+"_card").each(function() {
                var newcard = $(this).attr("id");
                var newclass = $("#"+newcard+" .front").attr("class");
                if((tgtclass == newclass)&&(tgtcard != newcard))
                {
                    /* ignore clicks while hint is generated */
                    input_off();

                    /* flip two cards for the poor child */
                    flip_sound.play();
                    $("#"+tgtcard).addClass('flip');
                    $("#"+newcard).addClass('flip');

                    if(update_matches(lvl))
                    {
                        match_sound.play();
                        window.setTimeout("Game.win_dlg("+lvl+")", fliptime);
                    }
                    else
                    {
                        match_sound.play();
                        window.setTimeout("Game.input_on()", fliptime);
                    }
                }
            });
        }
    }

    function start_game(lvl) {
        game_level = lvl;

        /* reset all the cards */
        $(".card").removeClass('flip');

        var types = new Array();
        var cardcount = gamedata[lvl].cardcount;
        var cardtypes = gamedata[lvl].cardcount/2;
        var i, j;

        $("#lvl"+(lvl+1)+"_matches").text("Matches 0/"+cardtypes);

        /* create a list of cards by index */
        for(i = 0; i < cardcount; i++)
            types.push((i%cardtypes)+1);

        /* randomly fill out the deck */
        for(i = 0; i < cardcount; i++)
        {
            var card_id = "#lvl"+(lvl+1)+"_card"+(i+1)+" .front";
            var target = (Math.random() * types.length)|0;
            var idx = types.splice(target, 1);
            var card_class = "front lvl"+(lvl+1)+"_card_type"+idx;
            $(card_id).attr('class', card_class);
        }

        input_on();
    }

    $(document).ready(function()
    {
        license_init("license");
        help_init();

        Game.card_flipped = card_flipped;
        Game.input_on = input_on;
        Game.input_off = input_off;
        Game.win_dlg = win_dlg;
        Game.start_game = start_game;

        lvl_bg_sound = new Array();
        lvl_bg_sound[0] = new gamesound("nightsky_sound", "audio/Nightsky.wav", true);
        lvl_bg_sound[1] = new gamesound("ocean_sound", "audio/Ocean.wav", true);
        lvl_bg_sound[2] = new gamesound("kitchen_sound", "audio/Kitchen.wav", true);
        flip_sound = new gamesound("flip_sound", "audio/FlipCard.wav");
        match_sound = new gamesound("match_sound", "audio/GetMatch.wav");
        mismatch_sound = new gamesound("mismatch_sound", "audio/WrongLose.wav");
        click_sound = new gamesound("click_sound", "audio/NavClick.wav");
        win_sound = new gamesound("win_sound", "audio/WinLevel.wav");

        $(window).on('tizenhwkey', function (e) {
            if (e.originalEvent.keyName === "back") {
                tizen.application.getCurrentApplication().exit();
            }
        });

        /* game launch buttons */
        $('#main_lvl1btn').bind('touchstart', function() {
            click_sound.play();
            $("#main_page").hide();
            $("#lvl1_page").show();
            lvl_bg_sound[0].play();
            start_game(0);
        });
    
        $('#main_lvl2btn').bind('touchstart', function() {
            click_sound.play();
            $("#main_page").hide();
            $("#lvl2_page").show();
            lvl_bg_sound[1].play();
            start_game(1);
        });

        $('#main_lvl3btn').bind('touchstart', function() {
            click_sound.play();
            $("#main_page").hide();
            $("#lvl3_page").show();
            lvl_bg_sound[2].play();
            start_game(2);
        });

        /* setup for game pages */
        $('.quit').bind('touchstart', function() {
            if(!ignore)
            {
                stop_bg_sounds();
                click_sound.play();
                $("#lvl1_page").hide();
                $("#lvl2_page").hide();
                $("#lvl3_page").hide();
                $("#main_page").show();
                game_level = -1;
            }
        });

        $('.hint').bind('touchstart', function() {
            if(!ignore)
            {
                var id = $(this).attr("id");
                generate_hint(parseInt(id.substring(3, 4)));
            }
        });

        $('.card').bind('touchstart', function(){
            if(!ignore&&!($(this).hasClass('flip')))
            {
                /* start the flip animation */
                flip_sound.play();
                $(this).addClass('flip');

                /* ignore clicks during flip */
                input_off();

                /* set the function to be called after the animation has done */
                window.setTimeout("Game.card_flipped("+($(this).attr("id"))+")", fliptime);
            }
        });

        $("#win_btn1").bind('touchstart', function() {
            click_sound.play();
            $("#win_dlg_page").hide();
            $(".card").removeClass('flip');
            window.setTimeout("Game.start_game("+(win_level-1)+")", fliptime);
        });

        $("#win_btn2").bind('touchstart', function() {
            click_sound.play();
            var next_level = ((win_level)%3)+1;
            $("#win_dlg_page").hide();
            $("#lvl"+win_level+"_page").hide();
            $("#lvl"+next_level+"_page").fadeIn("fast");
            stop_bg_sounds();
            lvl_bg_sound[next_level-1].play();
            start_game(next_level-1);
        });

        $("#win_btn3").bind('touchstart', function() {
            stop_bg_sounds();
            click_sound.play();
            $("#win_dlg_page").hide();
            $("#lvl1_page").hide();
            $("#lvl2_page").hide();
            $("#lvl3_page").hide();
            $("#main_page").show();
            game_level = -1;
        });

        window.onblur = function() {
            if(infocus)
            {
                infocus = false;
                if(game_level >= 0)
                    lvl_bg_sound[game_level].pause();
            }
        };

        window.onfocus = function() {
            if(!infocus)
            {
                infocus = true;
                if(game_level >= 0)
                    lvl_bg_sound[game_level].play();
            }
        };
    });
})()
