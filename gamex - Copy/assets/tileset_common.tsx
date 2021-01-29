<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.4" tiledversion="1.4.3" name="tileset_common" tilewidth="16" tileheight="16" tilecount="25" columns="0">
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="images/Checkpoint.png"/>
 </tile>
 <tile id="1">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="images/Floor1.png"/>
 </tile>
 <tile id="2">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="images/Goal.png"/>
 </tile>
 <tile id="3">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="images/ice_0.png"/>
 </tile>
 <tile id="4">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="images/Start.png"/>
 </tile>
 <tile id="5">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="images/Wall2.png"/>
 </tile>
 <tile id="7">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="images/Stone_brick.png"/>
 </tile>
 <tile id="8" type="ball">
  <properties>
   <property name="center" type="object" value="0"/>
   <property name="line" type="object" value="0"/>
   <property name="speed" type="float" value="50"/>
  </properties>
  <image width="16" height="16" source="images/DeathBot.png"/>
  <objectgroup draworder="index" id="3">
   <object id="2" x="0" y="0" width="16" height="16">
    <ellipse/>
   </object>
  </objectgroup>
 </tile>
 <tile id="10">
  <image width="16" height="16" source="images/coin_0.png"/>
  <animation>
   <frame tileid="10" duration="150"/>
   <frame tileid="11" duration="150"/>
   <frame tileid="12" duration="150"/>
   <frame tileid="13" duration="150"/>
  </animation>
 </tile>
 <tile id="11" type="coin">
  <image width="16" height="16" source="images/coin_1.png"/>
 </tile>
 <tile id="12" type="coin">
  <image width="16" height="16" source="images/coin_2.png"/>
 </tile>
 <tile id="13" type="coin">
  <image width="16" height="16" source="images/coin_3.png"/>
 </tile>
 <tile id="14">
  <image width="16" height="16" source="images/key_yellow.png"/>
 </tile>
 <tile id="15">
  <image width="16" height="16" source="images/door_yellow.png"/>
 </tile>
 <tile id="16">
  <image width="16" height="16" source="images/key_blue.png"/>
 </tile>
 <tile id="17">
  <image width="16" height="16" source="images/key_green.png"/>
 </tile>
 <tile id="18">
  <image width="16" height="16" source="images/key_red.png"/>
 </tile>
 <tile id="19">
  <image width="16" height="16" source="images/door_blue.png"/>
 </tile>
 <tile id="20">
  <image width="16" height="16" source="images/door_green.png"/>
 </tile>
 <tile id="21">
  <image width="16" height="16" source="images/door_red.png"/>
 </tile>
 <tile id="26">
  <image width="16" height="16" source="images/spike.png"/>
 </tile>
 <tile id="27">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="images/ice_1.png"/>
 </tile>
 <tile id="28">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="images/ice_2.png"/>
 </tile>
 <tile id="29">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="images/ice_3.png"/>
 </tile>
 <tile id="30">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="images/ice_4.png"/>
  <animation>
   <frame tileid="3" duration="10000"/>
   <frame tileid="27" duration="500"/>
   <frame tileid="28" duration="10000"/>
   <frame tileid="29" duration="500"/>
   <frame tileid="30" duration="500"/>
  </animation>
 </tile>
 <wangsets>
  <wangset name="New Wang Set" tile="-1"/>
 </wangsets>
</tileset>
