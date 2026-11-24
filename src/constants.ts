
export const MOCK_CITIES = [
  // ITALY
  "Rome, Italy", "Milan, Italy", "Naples, Italy", "Venice, Italy", "Florence, Italy", "Turin, Italy", "Palermo, Italy", "Bologna, Italy", "Catania, Italy", "Bari, Italy", "Verona, Italy", "Genoa, Italy", "Lamezia Terme, Italy", "Brindisi, Italy", "Olbia, Italy", "Alghero, Italy", "Cagliari, Italy", "Pescara, Italy", "Trieste, Italy", "Ancona, Italy", "Perugia, Italy", "Rimini, Italy", "Parma, Italy", "Bolzano, Italy", "Treviso, Italy", "Bergamo (BGY), Italy", "Pisa, Italy", "Reggio Calabria, Italy", "Trapani, Italy", "Comiso, Italy", "Pantelleria, Italy", "Lampedusa, Italy",
  // EUROPE - WEST & CENTRAL
  "London, UK", "Manchester, UK", "Liverpool, UK", "Birmingham, UK", "Glasgow, UK", "Edinburgh, UK", "Bristol, UK", "Leeds, UK", "Newcastle, UK", "Belfast, UK", "Cardiff, UK", "Aberdeen, UK",
  "Paris, France", "Lyon, France", "Marseille, France", "Nice, France", "Bordeaux, France", "Toulouse, France", "Nantes, France", "Strasbourg, France", "Montpellier, France", "Lille, France", "Ajaccio, France", "Bastia, France", "Beauvais, France",
  "Berlin, Germany", "Munich, Germany", "Frankfurt, Germany", "Hamburg, Germany", "Cologne, Germany", "Dusseldorf, Germany", "Stuttgart, Germany", "Hanover, Germany", "Nuremberg, Germany", "Leipzig, Germany", "Bremen, Germany", "Dortmund, Germany",
  "Madrid, Spain", "Barcelona, Spain", "Valencia, Spain", "Seville, Spain", "Malaga, Spain", "Bilbao, Spain", "Alicante, Spain", "Ibiza, Spain", "Palma de Mallorca, Spain", "Tenerife, Spain", "Gran Canaria, Spain", "Lanzarote, Spain", "Fuerteventura, Spain", "Girona, Spain", "Santiago de Compostela, Spain",
  "Lisbon, Portugal", "Porto, Portugal", "Faro, Portugal", "Funchal, Portugal", "Ponta Delgada, Portugal",
  "Amsterdam, Netherlands", "Eindhoven, Netherlands", "Rotterdam, Netherlands", "Brussels, Belgium", "Charleroi, Belgium", "Antwerp, Belgium", "Luxembourg City, Luxembourg",
  "Vienna, Austria", "Salzburg, Austria", "Innsbruck, Austria", "Graz, Austria", "Linz, Austria",
  "Zurich, Switzerland", "Geneva, Switzerland", "Basel, Switzerland", "Lugano, Switzerland", "Bern, Switzerland",
  "Dublin, Ireland", "Cork, Ireland", "Shannon, Ireland", "Knock, Ireland",
  // EUROPE - NORTH & EAST
  "Copenhagen, Denmark", "Billund, Denmark", "Aarhus, Denmark", "Stockholm, Sweden", "Gothenburg, Sweden", "Malmo, Sweden", "Oslo, Norway", "Bergen, Norway", "Stavanger, Norway", "Tromso, Norway", "Helsinki, Finland", "Rovaniemi, Finland", "Tampere, Finland",
  "Prague, Czech Republic", "Brno, Czech Republic", "Bratislava, Slovakia", "Kosice, Slovakia", "Budapest, Hungary", "Debrecen, Hungary", "Warsaw, Poland", "Krakow, Poland", "Gdansk, Poland", "Wroclaw, Poland", "Poznan, Poland", "Katowice, Poland",
  "Tallinn, Estonia", "Riga, Latvia", "Vilnius, Latvia", "Kaunas, Latvia",
  "Bucharest, Romania", "Cluj-Napoca, Romania", "Timisoara, Romania", "Iasi, Romania", "Sofia, Bulgaria", "Varna, Bulgaria", "Burgas, Bulgaria", "Belgrade, Serbia", "Nis, Serbia", "Zagreb, Croatia", "Split, Croatia", "Dubrovnik, Croatia", "Zadar, Croatia", "Pula, Croatia",
  "Ljubljana, Slovenia", "Sarajevo, Bosnia", "Banja Luka, Bosnia", "Tirana, Albania", "Skopje, North Macedonia", "Podgorica, North Macedonia", "Pristina, Kosovo",
  "Athens, Greece", "Thessaloniki, Greece", "Heraklion, Greece", "Rhodes, Greece", "Corfu, Greece", "Chania, Greece", "Santorini, Greece", "Mykonos, Greece", "Kos, Greece", "Zakynthos, Greece", "Kalamata, Greece",
  // MIDDLE EAST & AFRICA
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "Doha, Qatar", "Muscat, Oman", "Kuwait City, Kuwait", "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Dammam, Saudi Arabia", "Medina, Saudi Arabia", "Manama, Bahrain",
  "Tel Aviv, Israel", "Eilat, Israel", "Amman, Jordan", "Beirut, Lebanon", "Istanbul, Turkey", "Antalya, Turkey", "Ankara, Turkey", "Izmir, Turkey", "Bodrum, Turkey", "Dalaman, Turkey", "Cairo, Egypt", "Hurghada, Egypt", "Sharm El Sheikh, Egypt", "Luxor, Egypt", "Alexandria, Egypt",
  "Casablanca, Morocco", "Marrakech, Morocco", "Agadir, Morocco", "Fez, Morocco", "Tangier, Morocco", "Tunis, Tunisia", "Djerba, Tunisia", "Algiers, Algeria", "Oran, Algeria",
  "Johannesburg, South Africa", "Cape Town, South Africa", "Durban, South Africa", "Nairobi, Kenya", "Mombasa, Kenya", "Addis Ababa, Ethiopia", "Lagos, Nigeria", "Abuja, Nigeria", "Accra, Ghana", "Dakar, Senegal", "Dar es Salaam, Tanzania", "Zanzibar, Tanzania", "Mauritius", "Mahe, Seychelles",
  // ASIA & OCEANIA
  "Bangkok, Thailand", "Phuket, Thailand", "Chiang Mai, Thailand", "Krabi, Thailand", "Koh Samui, Thailand", "Kuala Lumpur, Malaysia", "Penang, Malaysia", "Langkawi, Malaysia", "Kota Kinabalu, Malaysia", "Singapore",
  "Jakarta, Indonesia", "Bali (Denpasar), Indonesia", "Surabaya, Indonesia", "Manila, Philippines", "Cebu, Philippines", "Boracay, Philippines", "Ho Chi Minh City, Vietnam", "Hanoi, Vietnam", "Da Nang, Vietnam", "Nha Trang, Vietnam", "Phu Quoc, Vietnam",
  "Hong Kong", "Macau", "Taipei, Taiwan", "Kaohsiung, Taiwan", "Seoul, South Korea", "Busan, South Korea", "Jeju, South Korea",
  "Tokyo, Japan", "Osaka, Japan", "Kyoto, Japan", "Nagoya, Japan", "Fukuoka, Japan", "Sapporo, Japan", "Okinawa, Japan", "Hiroshima, Japan",
  "Beijing, China", "Shanghai, China", "Guangzhou, China", "Shenzhen, China", "Chengdu, China", "Xi'an, China", "Kunming, China", "Hangzhou, China", "Nanjing, China", "Chongqing, China",
  "Mumbai, India", "New Delhi, India", "Bangalore, India", "Chennai, India", "Kolkata, India", "Hyderabad, India", "Kochi, India", "Goa, India", "Ahmedabad, India", "Pune, India",
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Adelaide, Australia", "Cairns, Australia", "Gold Coast, Australia", "Darwin, Australia", "Hobart, Australia", "Canberra, Australia",
  "Auckland, New Zealand", "Christchurch, New Zealand", "Queenstown, New Zealand", "Wellington, New Zealand",
  // NORTH AMERICA
  "New York, USA", "Los Angeles, USA", "Chicago, USA", "Miami, USA", "San Francisco, USA", "Seattle, USA", "Boston, USA", "Washington DC, USA", "Atlanta, USA", "Dallas, USA", "Houston, USA", "Las Vegas, USA", "Orlando, USA", "Denver, USA", "Phoenix, USA", "Philadelphia, USA", "Minneapolis, USA", "Detroit, USA", "Charlotte, USA", "Salt Lake City, USA", "Portland, USA", "Honolulu, USA", "San Diego, USA", "New Orleans, USA", "Nashville, USA", "Austin, USA",
  "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Calgary, Canada", "Edmonton, Canada", "Ottawa, Canada", "Halifax, Canada", "Winnipeg, Canada", "Quebec City, Canada",
  "Mexico City, Mexico", "Cancun, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico", "Puerto Vallarta, Mexico", "Cozumel, Mexico", "Tijuana, Mexico",
  // CENTRAL & SOUTH AMERICA
  "San Jose, Costa Rica", "Panama City, Panama", "Guatemala City, Guatemala", "San Salvador, El Salvador", "Belize City, Belize", "Havana, Cuba", "Varadero, Cuba", "Punta Cana, Dominican Republic", "Santo Domingo, Dominican Republic", "San Juan, Puerto Rico", "Nassau, Bahamas", "Kingston, Jamaica", "Montego Bay, Jamaica", "Port of Spain, Trinidad", "Bridgetown, Barbados", "Antigua",
  "Bogota, Colombia", "Medellin, Colombia", "Cartagena, Colombia", "Cali, Colombia", "Lima, Peru", "Cusco, Peru", "Quito, Ecuador", "Guayaquil, Ecuador", "Santiago, Chile", "Easter Island, Chile", "Buenos Aires, Argentina", "Cordoba, Argentina", "Mendoza, Argentina", "Sao Paulo, Brazil", "Rio de Janeiro, Brazil", "Brasilia, Brazil", "Salvador, Brazil", "Recife, Brazil", "Fortaleza, Brazil", "Manaus, Brazil", "Curitiba, Brazil", "Porto Alegre, Brazil", "Montevideo, Uruguay", "Asuncion, Paraguay", "La Paz, Bolivia", "Santa Cruz, Bolivia", "Caracas, Venezuela"
];
