module.exports = {
  type: "module", // Add this line
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/*"],
  moduleFileExtensions: ["ts", "js"],
  coverageDirectory: "./coverage",
};
