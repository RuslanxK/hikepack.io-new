const User = require("../models/user");

const calculateCategoryWeights = async (categories, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const userWeightOption = user.weightOption || "lb";

  const categoriesWithWeights = await Promise.all(
    categories.map(async (category) => {
      const { baseWeight, wornWeight } = category.items.reduce(
        (acc, item) => {
          let itemWeight = item.weight || 0;

          const itemWeightOption = item.weightOption || userWeightOption;
          switch (itemWeightOption) {
            case "kg":
              itemWeight *= userWeightOption === "lb" ? 2.2046226218 : 1;
              break;
            case "g":
              itemWeight /= userWeightOption === "lb" ? 453.59237 : 1000;
              break;
            case "oz":
              itemWeight /= userWeightOption === "lb" ? 16 : 35.27396195;
              break;
            case "lb":
            default:
              if (userWeightOption === "kg") itemWeight /= 2.2046226218;
              break;
          }

          const adjustedWeight = itemWeight * (item.qty || 1);

          if (item.worn) {
            acc.wornWeight += adjustedWeight;
          } else {
            acc.baseWeight += adjustedWeight;
          }

          return acc;
        },
        { baseWeight: 0, wornWeight: 0 }
      );

      const totalWeight = baseWeight + wornWeight;

      return {
        ...category,
        baseWeight: baseWeight.toFixed(2) + ` ${userWeightOption}`,
        wornWeight: wornWeight.toFixed(2) + ` ${userWeightOption}`,
        totalWeight: totalWeight.toFixed(2) + ` ${userWeightOption}`,
      };
    })
  );

  return categoriesWithWeights;
};

module.exports = calculateCategoryWeights;
