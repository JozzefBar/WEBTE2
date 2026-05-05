<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            ['Barcelona', 'Španielsko', 'es', 'Madrid', 'EUR', 'Euro', 41.3851, 2.1734, 2.5, 'Pulzujúce katalánske mesto s plážami, Gaudího architektúrou a bohatým nočným životom.', ['beach','historical','city'], [9,10,12,15,18,22,25,25,22,18,13,10], [5,6,8,10,14,18,21,21,18,14,9,6], [13,14,16,18,22,26,29,29,26,22,17,14]],
            ['Dubrovník', 'Chorvátsko', 'hr', 'Záhreb', 'EUR', 'Euro', 42.6507, 18.0944, 1.5, 'Perla Jadránu s historickými hradbami a krištáľovo čistým morom.', ['beach','historical'], [9,10,12,14,19,23,26,26,22,18,13,10], [5,6,8,10,14,18,21,21,18,14,9,6], [12,13,15,18,22,27,30,30,27,22,17,13]],
            ['Reykjavík', 'Island', 'is', 'Reykjavík', 'ISK', 'Islandská koruna', 64.1466, -21.9426, 4.5, 'Brána k ľadovcom, gejzírom a polárnej žiare.', ['adventure','mountains'], [-1,0,1,3,7,11,13,12,9,5,1,-1], [-4,-3,-2,0,3,7,9,8,5,2,-2,-4], [2,3,4,7,10,14,15,14,11,7,3,1]],
            ['Marrákeš', 'Maroko', 'ma', 'Rabat', 'MAD', 'Marocký dirham', 31.6295, -7.9811, 4.0, 'Exotické trhy, paláce a brána do Sahary.', ['historical','adventure'], [12,14,16,18,22,26,30,30,26,22,16,13], [6,8,10,12,15,18,21,21,18,14,10,7], [18,20,23,25,29,34,38,38,33,28,23,19]],
            ['Santorini', 'Grécko', 'gr', 'Atény', 'EUR', 'Euro', 36.3932, 25.4615, 2.5, 'Ikonický grécky ostrov s bielymi domčekmi a úchvatnými západmi slnka.', ['beach','city'], [10,10,12,15,19,24,26,26,23,19,15,12], [7,7,8,11,15,19,22,22,19,16,12,9], [14,14,16,19,23,28,30,30,27,23,19,15]],
            ['Praha', 'Česko', 'cz', 'Praha', 'CZK', 'Česká koruna', 50.0755, 14.4378, 1.0, 'Stovežaté mesto s bohatou históriou, gotickou architektúrou a skvelým pivom.', ['historical','city'], [-1,1,5,9,14,17,19,19,14,9,4,0], [-4,-3,0,3,8,11,13,13,9,5,1,-3], [2,4,9,15,20,23,25,25,20,14,7,3]],
            ['Istanbul', 'Turecko', 'tr', 'Ankara', 'TRY', 'Turecká líra', 41.0082, 28.9784, 2.5, 'Mesto na dvoch kontinentoch s mešitami, bazármi a úžasnou kuchyňou.', ['historical','city','adventure'], [6,6,8,13,17,22,25,25,21,16,11,8], [3,3,4,8,13,17,20,21,17,13,8,5], [9,10,12,17,22,27,29,29,25,20,15,11]],
            ['Rím', 'Taliansko', 'it', 'Rím', 'EUR', 'Euro', 41.9028, 12.4964, 1.5, 'Večné mesto plné antických pamiatok, umenia a vynikajúcej gastronómie.', ['historical','city'], [8,9,12,14,19,23,26,26,22,18,13,9], [3,4,6,9,13,16,19,19,16,12,8,4], [12,13,16,19,24,28,31,31,28,22,17,13]],
            ['Lisabon', 'Portugalsko', 'pt', 'Lisabon', 'EUR', 'Euro', 38.7223, -9.1393, 3.0, 'Mesto siedmich pahorkov s historickými električkami a pastéis de nata.', ['historical','city','beach'], [12,13,15,16,18,21,24,24,22,19,15,12], [8,9,11,12,14,17,19,19,18,15,11,9], [15,16,18,20,22,25,28,28,26,22,18,15]],
            ['Chamonix', 'Francúzsko', 'fr', 'Paríž', 'EUR', 'Euro', 45.9237, 6.8694, 1.5, 'Alpské stredisko pod Mont Blancom — raj pre lyžiarov aj horolezcov.', ['mountains','adventure'], [-2,0,4,7,12,15,18,17,13,9,3,-1], [-6,-5,-1,2,6,9,11,11,8,4,-1,-5], [3,5,9,13,17,21,24,23,19,13,7,3]],
            ['Amsterdam', 'Holandsko', 'nl', 'Amsterdam', 'EUR', 'Euro', 52.3676, 4.9041, 2.0, 'Mesto kanálov, múzeí Van Gogha a Rembrandta, a tulipánov.', ['city','historical'], [4,4,7,10,14,17,19,19,16,12,7,5], [1,1,3,5,9,12,14,14,11,8,4,2], [6,7,10,14,18,20,22,22,19,15,10,7]],
            ['Dubaj', 'SAE', 'ae', 'Abú Dhabí', 'AED', 'Emirátsky dirham', 25.2048, 55.2708, 5.5, 'Futuristické mesto v púšti s luxusom, mrakodrapmi a umelými ostrovmi.', ['beach','city','adventure'], [19,20,23,27,31,34,36,36,33,29,25,21], [14,15,18,21,25,28,30,31,28,24,20,16], [24,25,28,33,37,39,42,42,39,35,30,26]],
            ['Viedeň', 'Rakúsko', 'at', 'Viedeň', 'EUR', 'Euro', 48.2082, 16.3738, 0.5, 'Cisárske mesto s operou, kaviarňami a Schönbrunnom.', ['historical','city'], [1,3,7,12,17,20,22,22,17,12,6,2], [-3,-1,2,6,10,14,16,16,12,7,2,-1], [4,6,11,17,22,25,28,27,22,16,9,5]],
            ['Split', 'Chorvátsko', 'hr', 'Záhreb', 'EUR', 'Euro', 43.5081, 16.4402, 1.5, 'Diokleciánov palác pri mori — mix histórie a pláží.', ['beach','historical','city'], [8,9,11,14,19,23,26,26,22,17,12,9], [4,5,7,10,14,18,21,21,17,13,8,5], [12,13,16,19,24,28,31,31,27,22,16,13]],
            ['Budapešť', 'Maďarsko', 'hu', 'Budapešť', 'HUF', 'Maďarský forint', 47.4979, 19.0402, 0.8, 'Mesto termálnych kúpeľov, parlamentu na Dunaji a ruín barov.', ['historical','city'], [0,2,7,12,17,20,22,22,17,11,5,1], [-3,-1,2,6,11,14,16,16,12,7,2,-2], [3,5,11,17,22,26,28,28,22,16,8,4]],
            ['Nice', 'Francúzsko', 'fr', 'Paríž', 'EUR', 'Euro', 43.7102, 7.2620, 1.5, 'Srdce Francúzskej riviéry s promenádou, plážami a azúrovým morom.', ['beach','city'], [8,9,11,14,17,21,24,24,21,17,12,9], [4,5,7,10,14,17,20,20,17,13,8,5], [12,13,16,18,22,25,28,28,25,21,16,13]],
            ['Londýn', 'Veľká Británia', 'gb', 'Londýn', 'GBP', 'Britská libra', 51.5074, -0.1278, 2.5, 'Svetová metropola s kráľovskými palácmi, múzeami a divadlami.', ['city','historical'], [5,5,8,10,14,17,19,19,16,12,8,5], [2,2,3,5,8,11,14,13,11,8,5,3], [8,9,12,15,18,21,24,23,20,15,11,8]],
            ['Innsbruck', 'Rakúsko', 'at', 'Viedeň', 'EUR', 'Euro', 47.2692, 11.4041, 0.8, 'Alpské mesto obklopené horami — ideálne na lyžovanie aj turistiku.', ['mountains','adventure'], [-1,1,6,10,15,18,20,19,15,10,4,0], [-5,-4,0,3,8,11,13,12,9,5,0,-4], [3,5,11,15,20,23,25,24,20,15,8,4]],
            ['Kréta', 'Grécko', 'gr', 'Atény', 'EUR', 'Euro', 35.2401, 24.8093, 2.5, 'Najväčší grécky ostrov s plážami, súťažami a minojskou históriou.', ['beach','historical','adventure'], [12,12,14,17,21,25,28,28,24,20,16,13], [8,8,10,12,16,20,23,23,20,16,12,9], [16,16,18,21,25,29,32,32,28,24,20,17]],
            ['Salzburg', 'Rakúsko', 'at', 'Viedeň', 'EUR', 'Euro', 47.8095, 13.0550, 0.5, 'Mozartovo mesto v srdci Álp — hudba, príroda a histórie.', ['historical','mountains'], [-1,1,5,10,15,18,20,19,15,10,4,0], [-5,-4,0,3,7,11,13,12,9,5,0,-4], [3,5,10,15,20,23,25,24,20,14,7,3]],
            ['Mallorca', 'Španielsko', 'es', 'Madrid', 'EUR', 'Euro', 39.6953, 3.0176, 2.0, 'Baleársky ostrov s tyrkysovými zátokami a horskými dedinkami.', ['beach','mountains','adventure'], [10,11,13,15,19,23,26,27,23,19,14,11], [6,6,8,10,14,18,21,22,19,15,10,7], [15,15,17,19,23,28,31,31,28,23,18,15]],
            ['Paríž', 'Francúzsko', 'fr', 'Paríž', 'EUR', 'Euro', 48.8566, 2.3522, 2.0, 'Mesto svetla, Eiffelovky, Louvru a romantiky.', ['city','historical'], [5,6,9,12,16,19,22,21,18,13,8,5], [2,2,5,7,10,14,16,16,13,9,5,3], [7,9,13,16,20,23,26,25,22,16,10,7]],
            ['Zakynthos', 'Grécko', 'gr', 'Atény', 'EUR', 'Euro', 37.7870, 20.8979, 2.0, 'Ostrov s legendárnou Navagio plážou a korytnačkami.', ['beach','adventure'], [10,11,13,16,20,25,27,27,24,19,15,12], [6,7,8,11,15,19,21,21,18,15,11,8], [14,15,17,20,25,30,33,33,29,24,19,16]],
            ['Edinburg', 'Veľká Británia', 'gb', 'Londýn', 'GBP', 'Britská libra', 55.9533, -3.1883, 3.0, 'Škótske hlavné mesto s hradom, whisky a Highlands na dosah.', ['historical','city','mountains'], [4,5,6,8,11,14,15,15,13,9,6,4], [1,1,2,4,6,9,11,11,9,6,3,1], [7,8,9,12,15,17,19,19,16,12,9,7]],
            ['Antalya', 'Turecko', 'tr', 'Ankara', 'TRY', 'Turecká líra', 36.8969, 30.7133, 2.5, 'Turecká riviéra s antickými ruinami a tyrkysovým morom.', ['beach','historical'], [10,11,13,16,21,26,29,29,25,20,15,11], [5,6,7,10,15,19,23,23,19,14,10,7], [15,16,18,22,27,32,35,35,31,26,20,16]],
            ['Zermatt', 'Švajčiarsko', 'ch', 'Bern', 'CHF', 'Švajčiarsky frank', 46.0207, 7.7491, 1.5, 'Luxusné alpské stredisko pod Matterhornom.', ['mountains','adventure'], [-5,-4,0,3,8,12,14,14,10,5,0,-4], [-10,-9,-5,-2,3,6,8,8,5,1,-4,-8], [-1,0,4,8,13,17,20,19,15,10,4,0]],
            ['Kodaň', 'Dánsko', 'dk', 'Kodaň', 'DKK', 'Dánska koruna', 55.6761, 12.5683, 2.0, 'Hygge mesto s Nyhavnom, dizajnom a najlepšími reštauráciami.', ['city','historical'], [1,1,3,8,13,16,18,18,14,10,5,2], [-2,-2,0,3,8,11,14,13,10,7,3,0], [3,4,6,12,17,20,22,22,18,13,7,4]],
            ['Kappadócia', 'Turecko', 'tr', 'Ankara', 'TRY', 'Turecká líra', 38.6431, 34.8289, 3.0, 'Rozprávková krajina skalných miest a balonových letov.', ['adventure','historical'], [0,2,6,11,16,20,24,24,19,13,7,2], [-5,-4,0,4,8,12,15,15,10,6,1,-3], [5,7,12,18,23,27,31,31,26,20,12,6]],
            ['Tenerife', 'Španielsko', 'es', 'Madrid', 'EUR', 'Euro', 28.2916, -16.6291, 4.5, 'Kanársky ostrov s večným jarom, sopkou Teide a čiernymi plážami.', ['beach','mountains','adventure'], [18,18,19,20,21,23,25,26,25,23,21,19], [14,14,15,16,17,19,21,22,21,19,17,15], [21,22,22,23,24,27,29,30,29,26,24,22]],
            ['Krakov', 'Poľsko', 'pl', 'Varšava', 'PLN', 'Poľský zlotý', 50.0647, 19.9450, 1.0, 'Kráľovské mesto s Wawelom, soľnými baňami a živým námestím.', ['historical','city'], [-2,0,4,9,14,18,20,19,14,9,4,0], [-6,-4,0,3,8,11,13,12,8,4,0,-4], [1,3,9,15,20,23,25,24,19,14,7,2]],
            ['Malta', 'Malta', 'mt', 'Valletta', 'EUR', 'Euro', 35.8989, 14.5146, 2.0, 'Ostrovný štát s rytierskou históriou, azúrovým morom a slnkom.', ['beach','historical','city'], [13,13,14,16,20,24,27,28,25,22,18,14], [10,10,11,13,16,20,23,24,22,18,14,11], [16,16,18,20,24,29,32,32,29,26,21,17]],
            ['Tromsø', 'Nórsko', 'no', 'Oslo', 'NOK', 'Nórska koruna', 69.6496, 18.9560, 3.5, 'Brána do Arktídy — polárna žiara a polnočné slnko.', ['adventure','mountains'], [-4,-4,-2,1,6,10,13,12,8,3,-1,-3], [-7,-7,-5,-2,2,6,9,8,5,0,-4,-6], [-1,-1,1,4,9,14,16,15,11,5,2,0]],
            ['Tbilisi', 'Gruzínsko', 'ge', 'Tbilisi', 'GEL', 'Gruzínsky lari', 41.7151, 44.8271, 3.5, 'Starobylé mesto s unikátnou kuchyňou, vínom a horami Kaukazu.', ['historical','adventure','city'], [2,3,7,12,17,21,24,24,19,13,7,3], [-2,-1,2,7,11,15,18,18,14,8,3,-1], [6,8,13,18,23,27,31,30,25,18,12,7]],
            ['Funchal', 'Portugalsko', 'pt', 'Lisabon', 'EUR', 'Euro', 32.6669, -16.9241, 4.0, 'Madeira — ostrov večnej jari s exotickými záhradami a levádami.', ['mountains','adventure','beach'], [16,16,16,17,18,20,22,23,23,21,18,17], [13,13,13,14,15,17,19,20,20,18,16,14], [19,19,20,20,21,23,25,26,26,24,21,19]],
            ['Bangkok', 'Thajsko', 'th', 'Bangkok', 'THB', 'Thajský baht', 13.7563, 100.5018, 10.0, 'Živé ázijské mesto s chrámami, pouličným jedlom a nočnými trhmi.', ['city','adventure'], [27,28,30,31,30,29,29,29,28,28,27,26], [22,23,25,27,26,26,25,25,25,25,24,22], [32,33,34,35,33,33,32,32,32,31,31,31]],
        ];

        foreach ($destinations as $d) {
            $destId = DB::table('destinations')->insertGetId([
                'name' => $d[0], 'country' => $d[1], 'country_code' => $d[2],
                'capital' => $d[3], 'currency_code' => $d[4], 'currency_name' => $d[5],
                'latitude' => $d[6], 'longitude' => $d[7],
                'flight_hours_from_vienna' => $d[8], 'description' => $d[9],
                'created_at' => now(), 'updated_at' => now(),
            ]);

            // Types
            foreach ($d[10] as $type) {
                DB::table('destination_types')->insert([
                    'destination_id' => $destId, 'type' => $type,
                ]);
            }

            // Monthly weather (12 months)
            for ($m = 0; $m < 12; $m++) {
                DB::table('monthly_weather')->insert([
                    'destination_id' => $destId,
                    'month' => $m + 1,
                    'avg_temp' => $d[11][$m],
                    'avg_min_temp' => $d[12][$m],
                    'avg_max_temp' => $d[13][$m],
                ]);
            }
        }
    }
}
