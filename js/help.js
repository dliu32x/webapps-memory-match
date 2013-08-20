/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

function help_init()
{
    $('.helplaunch').click(function() {
        $('#help_dialog').removeClass('helpdialog').addClass('helpdialog shown');
    });

    $('.close').click(function() {
        $('#help_dialog').removeClass('helpdialog shown').addClass('helpdialog');
    });
}

