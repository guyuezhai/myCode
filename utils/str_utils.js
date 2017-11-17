 
 module.exports = {

    genStrCode: function(len){

        let str = '';

        let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';

        for(i=0;i<len;i++){

            str +=chars.charAt(Math.floor(Math.random()*chars.length));

        }

        return str;

    }

 }
 
