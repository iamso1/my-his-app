var express = require('express');
var router = express.Router();
const axios = require('axios');
const { addDays, eachDayOfInterval, format } = require('date-fns');

const map = {
  1: [1],
  2: [3],
  3: [1],
  4: [3],
  5: [3],
  6: [1, 2],
};

const basicUrl = 'https://www.tmh.org.tw/TMH2016/RegDr.aspx';

const request = async (date, noon) => {
  try {
    const result = await axios.get(basicUrl, {
      params: {
        Kind: 2,
        Sect: 1227,
        dept: 'CC',
        Date: date,
        Noon: noon,
      },
    });

    console.log(result);
    return {
      date,
      noon,
      available: result.data.includes('ctl00_ContentPlaceHolder1_TB_ID'),
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

const main = async () => {
  const interval = eachDayOfInterval({
    start: new Date(),
    end: addDays(new Date(), 28),
  })
    .filter((date) => map[date.getDay()])
    .map((date) => {
      // const date = format(date, 'yyyy/MM/dd');
      const noon = map[date.getDay()];
      return noon.map((noon) => [format(date, 'yyyy/MM/dd'), noon]);
    })
    .reduce((result, value) => result.concat(value), []);

  const available = await (
    await Promise.all(interval.map((dateAndNoon) => request(...dateAndNoon)))
  )
    .filter(({ available }) => available)
    .map(({ date, noon }) => [format(new Date(date), 'yyyy-mm-dd EEE'), noon]);
  return available;
};

/* GET users listing. */
router.get('/', async function (req, res, next) {
  const result = await main();
  res.send(result);
});

module.exports = router;
