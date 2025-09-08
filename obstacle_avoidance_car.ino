#include <Servo.h>

// Pin Definitions
const int trigPin = 9;  // Ultrasonic sensor TRIG pin
const int echoPin = 10; // Ultrasonic sensor ECHO pin
const int servoPin = 11; // Servo motor pin
const int leftMotorForward = 3;  // Left motor forward pin
const int leftMotorBackward = 4; // Left motor backward pin
const int rightMotorForward = 5; // Right motor forward pin
const int rightMotorBackward = 6; // Right motor backward pin

Servo ultrasonicServo; // Servo motor object
const int servoLeft = 0;   // Servo position for left
const int servoRight = 180; // Servo position for right
const int servoCenter = 90; // Servo position for center

// Variables
long duration;
int distance;
const int safeDistance = 15; // Safe distance from obstacles in cm

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(leftMotorForward, OUTPUT);
  pinMode(leftMotorBackward, OUTPUT);
  pinMode(rightMotorForward, OUTPUT);
  pinMode(rightMotorBackward, OUTPUT);

  // Attach the servo
  ultrasonicServo.attach(servoPin);
  ultrasonicServo.write(servoCenter);

  Serial.begin(9600);
}

void loop() {
  int distanceCenter = measureDistance();
  if (distanceCenter < safeDistance) {
    stopCar();
    avoidObstacle();
  } else {
    moveForward();
  }
}

// Measure the distance using the ultrasonic sensor
int measureDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2; // Convert to cm

  return distance;
}

// Move the car forward
void moveForward() {
  digitalWrite(leftMotorForward, HIGH);
  digitalWrite(leftMotorBackward, LOW);
  digitalWrite(rightMotorForward, HIGH);
  digitalWrite(rightMotorBackward, LOW);
}

// Stop the car
void stopCar() {
  digitalWrite(leftMotorForward, LOW);
  digitalWrite(leftMotorBackward, LOW);
  digitalWrite(rightMotorForward, LOW);
  digitalWrite(rightMotorBackward, LOW);
}

// Turn the car left
void turnLeft() {
  digitalWrite(leftMotorForward, LOW);
  digitalWrite(leftMotorBackward, LOW);
  digitalWrite(rightMotorForward, HIGH);
  digitalWrite(rightMotorBackward, LOW);
  delay(500);
}

// Turn the car right
void turnRight() {
  digitalWrite(leftMotorForward, HIGH);
  digitalWrite(leftMotorBackward, LOW);
  digitalWrite(rightMotorForward, LOW);
  digitalWrite(rightMotorBackward, LOW);
  delay(500);
}

// Avoid obstacle by scanning left and right
void avoidObstacle() {
  ultrasonicServo.write(servoLeft);
  delay(500);
  int distanceLeft = measureDistance();

  ultrasonicServo.write(servoRight);
  delay(500);
  int distanceRight = measureDistance();

  ultrasonicServo.write(servoCenter);
  delay(500);

  if (distanceLeft > distanceRight) {
    turnLeft();
  } else {
    turnRight();
  }
}