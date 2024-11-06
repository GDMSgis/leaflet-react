import math
import re

#https://www.movable-type.co.uk/scripts/latlong.html Intersection of 2 paths given start points and bearings
#input is radians -> degrees
def calc_intersection(lat1, long1, bearing1, lat2, long2, bearing2):
    first_term = math.pow((lat2 - lat1) / 2, 2)
    second_term = math.cos(lat1) * math.cos(lat2) * math.pow(math.sin((long2 - long1) / 2), 2)
    ang_dist_12 = 2 * math.asin(math.sqrt(first_term + second_term))

    numerator = math.sin(lat2) - math.sin(lat1) * math.cos(ang_dist_12)
    denominator = math.sin(ang_dist_12) * math.cos(lat1)
    theta_a = math.acos(numerator / denominator)

    numerator = math.sin(lat1) - math.sin(lat2) * math.cos(ang_dist_12)
    denominator = math.sin(ang_dist_12) * math.cos(lat2)
    theta_b = math.acos(numerator / denominator)
    if math.sin(long2 - long1) > 0:
        theta_12 = theta_a
        theta_21 = 2 * math.pi - theta_b
    else:
        theta_12 = 2 * math.pi - theta_a
        theta_21 = theta_b

    alpha1 = bearing1 - theta_12
    alpha2 = theta_21 - bearing2

    first_term = -math.cos(alpha1) * math.cos(alpha2)
    second_term = math.sin(alpha1) * math.sin(alpha2) * math.cos(ang_dist_12)
    alpha3 = math.acos(first_term + second_term)

    first_term = math.sin(ang_dist_12) * math.sin(alpha1) * math.sin(alpha2)
    second_term = math.cos(alpha2) + math.cos(alpha1) * math.cos(alpha3)
    ang_dist_13 = math.atan2(first_term, second_term)

    first_term = math.sin(lat1) * math.cos(ang_dist_13)
    second_term = math.cos(lat1) * math.sin(ang_dist_13) * math.cos(bearing1)
    lat3 = math.asin(first_term + second_term)

    first_term = math.sin(bearing1) * math.sin(ang_dist_13) * math.cos(lat1)
    second_term = math.cos(ang_dist_13) - math.sin(lat1) * math.sin(lat3)
    d_long13 = math.atan2(first_term, second_term)

    long3 = long1 + d_long13
    return math.degrees(lat3), math.degrees(long3)

#Degrees as a string XX* X' X" N
def degrees_to_decimal(degrees):
    nums = [float(x) for x in re.findall("\d+", degrees)]
    nums[1] += nums[2] / 60
    nums[0] += nums[1] / 60
    print(nums[0])
    
    if "S" in degrees or "W" in degrees:
        nums[0] *= -1
    
    return nums[0]

def decimalToDegrees(lat, long):
    latDirection = "N"
    longDirection = "E"
    if (lat < 0):
      latDirection = "S"
      lat *= -1;
    if (long < 0):
      longDirection = "W"
      long *= -1

    latdeg = math.trunc(lat)
    latmin = math.trunc((lat - latdeg) * 60)
    latsec = math.trunc(((lat - latdeg) * 60 - latmin) * 60)

    latdeg = str(latdeg)
    latmin = str(latmin) if latmin > 9 else str(0) + str(latmin)
    latsec = str(latsec) if latsec > 9 else str(0) + str(latsec)

    latString = f"{latdeg}\u00B0 {latmin}\' {latsec}\" {latDirection}"

    longdeg = math.trunc(long)
    longmin = math.trunc((long - longdeg) * 60)
    longsec = math.trunc(((long - longdeg) * 60 - longmin) * 60)

    longdeg = str(longdeg)
    longmin = str(longmin) if longmin > 9 else str(0) + str(longmin)
    longsec = str(longsec) if longsec > 9 else str(0) + str(longsec)

    longString = f"{longdeg}\u00B0 {longmin}\' {longsec}\" {longDirection}"

    return latString, longString