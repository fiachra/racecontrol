var qr = require('qr-image');
var PDFDocument = require('pdfkit');
var fs = require('fs');
var xml2js = require('xml2js');
var async = require('async');
var _ = require('underscore');
var moment = require('moment');

//var qr_svg = qr.image('I love QR!', { type: 'png' });
//qr_svg.pipe(fs.createWriteStream('i_love_qr.png'));
var urlStr = 'http://172.20.10.2:3000/users/checkin';

module.exports = {
    urlStr: 'http://172.20.10.2:3000/users/checkin',
    pad: function(str, max)
    {
        return str.length < max ? this.pad("0" + str, max) : str;
    },
    createListPdf: function(pdfName, classList, callback)
    {
        //console.log(JSON.stringify(classList));
        var that = this;

        //595 × 842 

        var doc = new PDFDocument(
        {
            size: "A4",
            layout: 'portrait'
        });

        var fileName = 'Class_' + pdfName + '.pdf';
        var fullName = 'public/files/' + fileName;
        var url = '/files/' + fileName;
        var retVal = {
            className: pdfName,
            filename: fileName,
            url: url,
            generateTime: moment().toISOString()
        }

        doc.pipe(fs.createWriteStream(fullName));

        async.eachSeries(classList, function(person, innerCB)
        {
            var userURLStr = that.urlStr + "/" + person.racenumber.toString();
            var svg_string = qr.imageSync(userURLStr,
            {
                type: 'svg',
                size: 5
            });

            xml2js.parseString(svg_string, function(err, result)
            {
                //console.log(JSON.stringify(result,null,2));
                var svgSize = 31;
                var pageWidth = 595;
                var finalSizeRatio = 0.5;

                var finalWidth = pageWidth * finalSizeRatio;
                var scale = (pageWidth / svgSize) * finalSizeRatio;
                var offsetForCenter = (pageWidth / 2) - (finalWidth / 2);

                doc.image('public/images/schlogo.jpg', 30, 30,
                {
                    width: 75
                });

                doc.fontSize(40).text('Confey College Run',
                {
                    align: "center"
                }).moveDown();

                doc.fontSize(35).text(person.name,
                {
                    align: "center"
                }).moveDown();

                doc.fontSize(35).text('Race No: ' + that.pad(person.racenumber.toString(), 5),
                {
                    align: "center"
                }).moveDown().save();

                var pthString = result.svg.path[0].$.d;

                doc.translate(offsetForCenter, 400).scale(scale).path(pthString).fill().restore();

                var now = moment(new Date(retVal.generateTime));
                var string = "Generated: " + now.format('llll');

                doc.fontSize(9).text(string, 20, 755);
 
                doc.addPage()
                console.log("page Done")

                innerCB();

            });

        }, function(err)
        {
            if (err)
            {
                // One of the iterations produced an error.
                // All processing will now stop.
                callback(err)
                console.log('A file failed to process');
            }
            else
            {
                doc.end()
                callback(null, retVal);
                console.log('All files have been processed successfully');
            }
        });

    }
};
