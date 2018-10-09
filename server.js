const express = require('express'),
    hbs = require('hbs'),
    processing = require('./dataProcessing'),
    port = process.env.PORT || 3000

let app = express();

hbs.registerPartials(__dirname + '/views/partials')

hbs.registerHelper('createMenu', name => name)
hbs.registerHelper('dayOfWeek', item => item.day)
hbs.registerHelper('commonClasses', item => item.classes)

app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))

app.get('/', async (req, res) => {
    let data = await processing.getData(),
        common = data.commonObj,
        arr = []
    for (let i = 0; i < Object.keys(common).length; i++) {
        let obj = {
            item: {
                day: Object.keys(common)[i],
                classes: Object.values(common)[i]
            }
        };
        arr.push(obj)
    }

    res.render('home.hbs', {
        pageTitle: 'Home page',
        all_institutes: data.all_institutes,
        groups_1: data.all_groups_first,
        groups_2: data.all_groups_second,
        selectedInstFirst: data.s_inst_first,
        selectedInstSecond: data.s_inst_second,
        selectedGroupFirst: data.s_group_first,
        selectedGroupSecond: data.s_group_second,
        common: arr
    })
});

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`)
});