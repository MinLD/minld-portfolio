import "dotenv/config";
import { prisma } from "../src/database/prisma.js";
const categories = [
  ["Daily Life", "daily-life"],
  ["Friends", "friends"],
  ["Travel", "travel"],
  ["Food & Drinks", "food-drinks"],
  ["Nature", "nature"],
  ["Selfies", "selfies"],
  ["Mood", "mood"],
  ["Love", "love"],
  ["Hobbies", "hobbies"],
  ["Memories", "memories"],
  ["Music", "music"],
  ["Sports", "sports"],
  ["Badminton", "badminton"],
  ["Work & Study", "work-study"],
  ["Coding", "coding"],
  ["Night Life", "night-life"],
  ["Sunset", "sunset"],
  ["Pets", "pets"],
  ["Events", "events"],
  ["Random", "random"],
] as const;

const tags = [
  ["#DailyLife", "dailylife"],
  ["#EverydayMoments", "everydaymoments"],
  ["#LifeUpdate", "lifeupdate"],

  ["#Friends", "friends"],
  ["#Besties", "besties"],
  ["#GoodTimes", "goodtimes"],

  ["#Travel", "travel"],
  ["#Adventure", "adventure"],
  ["#ExploreMore", "exploremore"],

  ["#Foodie", "foodie"],
  ["#GoodFood", "goodfood"],
  ["#CoffeeTime", "coffeetime"],

  ["#Nature", "nature"],
  ["#OutdoorLife", "outdoorlife"],
  ["#BeautifulPlaces", "beautifulplaces"],

  ["#Selfie", "selfie"],
  ["#JustMe", "justme"],
  ["#MeToday", "metoday"],

  ["#Mood", "mood"],
  ["#CurrentMood", "currentmood"],
  ["#Vibes", "vibes"],

  ["#Love", "love"],
  ["#SweetMoments", "sweetmoments"],
  ["#Together", "together"],

  ["#Hobbies", "hobbies"],
  ["#FreeTime", "freetime"],
  ["#DoingWhatILove", "doingwhatilove"],

  ["#Memories", "memories"],
  ["#Throwback", "throwback"],
  ["#GoodMemories", "goodmemories"],

  ["#Music", "music"],
  ["#NowPlaying", "nowplaying"],
  ["#MusicVibes", "musicvibes"],

  ["#Sports", "sports"],
  ["#GameTime", "gametime"],
  ["#StayActive", "stayactive"],

  ["#Badminton", "badminton"],
  ["#ShuttleLife", "shuttlelife"],
  ["#CourtTime", "courttime"],

  ["#WorkLife", "worklife"],
  ["#StudyTime", "studytime"],
  ["#ProductiveDay", "productiveday"],

  ["#Coding", "coding"],
  ["#DeveloperLife", "developerlife"],
  ["#BuildInPublic", "buildinpublic"],

  ["#NightLife", "nightlife"],
  ["#NightVibes", "nightvibes"],
  ["#AfterDark", "afterdark"],

  ["#Sunset", "sunset"],
  ["#GoldenHour", "goldenhour"],
  ["#SkyLovers", "skylovers"],

  ["#Pets", "pets"],
  ["#PetLife", "petlife"],
  ["#CuteMoments", "cutemoments"],

  ["#Events", "events"],
  ["#SpecialDay", "specialday"],

  ["#Random", "random"],
  ["#RandomMoments", "randommoments"],
  ["#JustBecause", "justbecause"],
] as const;

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const [name, slug] of categories) {
      await tx.momentCategory.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
    }

    for (const [name, slug] of tags) {
      await tx.momentTag.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
    }
  });

  console.log(`Seeded ${categories.length} categories`);
  console.log(`Seeded ${tags.length} unique tags`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
