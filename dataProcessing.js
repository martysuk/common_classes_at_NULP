const axios = require('axios'),
    cheerio = require('cheerio'),
    jsonframe = require('jsonframe-cheerio')


module.exports.getData = async () => {
    let html
    let data_1 = await axios.get('http://lp.edu.ua/students_schedule?institutecode_selective=%D0%86%D0%9C%D0%A4%D0%9D&edugrupabr_selective=%D0%9F%D0%9C-31')
        .then(response => {
            html = response.data;
            return scrapping(html)
        })
        .catch(error => console.log(error))


    let data_2 = await axios.get('http://lp.edu.ua/students_schedule?institutecode_selective=%D0%86%D0%9A%D0%9D%D0%86&edugrupabr_selective=%D0%9A%D0%9D-319')
        .then(response => {
            html = response.data;
            return scrapping(html)
        })
        .catch(error => console.log(error))

    let all_institutes = await axios.get('http://lp.edu.ua/students_schedule')
        .then(response => {
            const $ = cheerio.load(response.data)
            jsonframe($) // initializing the plugin
            let i_selector = {
                "available": {
                    _s: "#edit-institutecode-selective",
                    _d: {
                        institutes: ["option"]
                    }
                }
            },
                all_institutes = $('body').scrape(i_selector).available.institutes,
                arr = []


            for (let i = 0; i < all_institutes.length; i++) {
                let obj = {}
                obj.name = all_institutes[i]
                arr.push(obj)
            }
            return arr
        })
        .catch(error => console.log(error))


    let schedule_1 = data_1.result,
        schedule_2 = data_2.result;

    let commonObj = findCommon(schedule_1, schedule_2)

    return {
        commonObj,
        all_institutes,
        all_groups_first: data_1.groups_arr,
        all_groups_second: data_2.groups_arr,
        s_inst_first: data_1.s_institute,
        s_inst_second: data_2.s_institute,
        s_group_first: data_1.s_group,
        s_group_second: data_2.s_group,
    }
}

const scrapping = html => {

    const $ = cheerio.load(html)
    jsonframe($) // initializing the plugin

    let institute = {
        "selected": "#edit-institutecode-selective [selected=selected]" // output an extracted email
    },
        group = {
            "selected": "#edit-edugrupabr-selective [selected=selected]"
        },
        g_selector = {
            "available": {
                _s: "#edit-edugrupabr-selective",
                _d: {
                    groups: ["option"]
                }
            }
        },
        s_institute = $('body').scrape(institute).selected,
        s_group = $('body').scrape(group).selected,
        all_groups = $('body').scrape(g_selector).available.groups

    let groups_arr = []
    for (let i = 0; i < all_groups.length; i++) {
        let obj = {}
        obj.name = all_groups[i]
        groups_arr.push(obj)
    }

    let daysFrame = { days: [".view-grouping-header"] },
        week = JSON.parse($('body').scrape(daysFrame, { string: true })).days,
        frame = {
            "classes": {
                _s: ".view-grouping-content",
                _d: [{
                    day: typeof "h3" !== 'undefined' ? ["h3"] : ['']
                }]
            }
        },
        schedule = $('body').scrape(frame).classes


    let result = {}

    //changing keys 'day' into real strings ('Пн','Вт' and so on)
    for (let i = 0; i < schedule.length; i++) {
        result[week[i]] = schedule[i]['day']
    }

    return { result, s_institute, s_group, groups_arr }
}

const findCommon = (schedule_1, schedule_2) => {
    let result = {}
    let week = Object.keys(schedule_1)
    for (let j = 0; j < week.length; j++) { //loop in object
        let arr = []
        for (let i = 0; i < schedule_1[week[j]].length; i++) { //loop by classes in each day
            if (schedule_2[week[j]].indexOf(schedule_1[week[j]][i]) > -1) {
                arr.push(schedule_1[week[j]][i])
            }
            result[week[j]] = arr
        }
    }
    return result
}







//<link type="text/css" rel="stylesheet" href="../styles.css">
//app.use('/css',express.static(path.resolve(__dirname, '../public/styles.css')));


/*    console.log(name + ' -+- ' + selected)
    if (name === selected)
        return new hbs.SafeString(
            "<option value=" + name + "selected=\"selected\">" + name + "</option>")
    else
        return new hbs.SafeString(
            "<option value=" + name + ">" + name + "</option>")
*/

/*hbs.registerHelper('select', function( value, options ){
    var $el = $('<select />').html( options.fn(this) );
    $el.find('[value="' + value + '"]').attr({'selected':'selected'});
    return $el.html();
});*/