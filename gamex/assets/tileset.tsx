<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.4" tiledversion="1.4.3" name="tileset" tilewidth="16" tileheight="16" tilecount="8" columns="0">
 <editorsettings>
  <export target="tileset.json" format="json"/>
 </editorsettings>
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/Checkpoint.png"/>
 </tile>
 <tile id="1">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/Floor1.png"/>
 </tile>
 <tile id="2">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/Goal.png"/>
 </tile>
 <tile id="3">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/ice.png"/>
 </tile>
 <tile id="4">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/Start.png"/>
 </tile>
 <tile id="5">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/Wall2.png"/>
 </tile>
 <tile id="6">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value="coin"/>
  </properties>
  <image width="16" height="16" source="images/coin_single.png"/>
 </tile>
 <tile id="7">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
   <property name="object" value=""/>
  </properties>
  <image width="16" height="16" source="images/Stone_brick.png"/>
 </tile>
 <wangsets>
  <wangset name="New Wang Set" tile="-1"/>
 </wangsets>
</tileset>
