import moment from 'moment'

class DateUtil {
  getDayList(){
    moment.locale('ja');
    const dayList = [];
    let targetDay;
    for (let i = 0; i < 60; i++) {
      targetDay = moment().add(i, 'days').format('YYYY-MM-DD');
      dayList.push({text: targetDay, value: targetDay});
    }
    return dayList
  }

  decorateFormat(res){
    let dayArray = '';
    res.map( day => {
      console.log(day)
      dayArray = `${dayArray}${moment(day['date']).format('YYYY-MM-DD')}\n`
    })
    return dayArray
  }

  summaryDate(res) {
    return res.map( day => day['hours']).reduce((sum, value) => sum + value, 0);
  }
}
// console.log(links.join('\n'));

const dateUtil = new DateUtil();
export default dateUtil;
